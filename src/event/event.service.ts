import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { EventPhoto } from './entities/event-photo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TournamentBracket } from 'src/tournament-bracket/entities/tournament-bracket.entity';
import { EventRegistration } from 'src/event-registration/entities/event-registration.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { NotificationService } from 'src/notification/notification.service';
import { StorageService } from 'src/storage/storage.service';
import { CurrentUserPayload } from 'src/auth/decorators/current-user.decorator';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,

    @InjectRepository(TournamentBracket)
    private bracketRepository: Repository<TournamentBracket>,

    @InjectRepository(EventPhoto)
    private photoRepo: Repository<EventPhoto>,

    @InjectRepository(EventRegistration)
    private registrationRepo: Repository<EventRegistration>,

    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly storage: StorageService,
  ) {}

  private isManager(event: Event, currentUser: CurrentUserPayload) {
    return (
      currentUser.userType === 'admin' ||
      event.user?.id === currentUser.id ||
      event.organizers?.some((o) => o.id === currentUser.id)
    );
  }

  private assertCanManage(event: Event, currentUser: CurrentUserPayload) {
    if (!this.isManager(event, currentUser)) {
      throw new ForbiddenException(
        'Apenas o criador, os organizadores ou um admin podem alterar este evento',
      );
    }
  }

  private async registeredUserIds(eventId: number): Promise<number[]> {
    const regs = await this.registrationRepo.find({
      where: { event: { id: eventId }, active: true },
    });
    return regs.map((r) => r.user.id);
  }

  private describe(event: Event) {
    const when = event.date
      ? new Date(event.date).toLocaleString('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
        })
      : 'data a definir';
    return event.location ? `${when} — ${event.location}` : when;
  }

  async create(
    dto: CreateEventDto,
    currentUser: CurrentUserPayload,
  ): Promise<Event> {
    const { organizerIds, bracketType, teamCount, ...rest } = dto;
    const event = this.eventRepo.create(rest as Partial<Event>);
    event.user = { id: currentUser.id } as User;
    event.organizers = organizerIds?.length
      ? await this.userService.findByIds(organizerIds)
      : [await this.userService.findOne(currentUser.id)];

    if (bracketType) {
      const bracket = this.bracketRepository.create({
        name: `${dto.title} - Bracket`,
        type: bracketType,
        teamCount: teamCount ?? 2,
      });
      event.tournamentBracket = await this.bracketRepository.save(bracket);
    }

    const saved = await this.eventRepo.save(event);

    const athletes = await this.userService.findIdsByType('aluno');
    await this.notificationService.notifyUsers(athletes, {
      type: 'event_created',
      title: `Novo evento: ${saved.title}`,
      message: this.describe(saved),
      link: `/evento/${saved.id}`,
    });

    return this.findOne(saved.id);
  }

  findAll() {
    return this.eventRepo.find({ order: { date: 'ASC' } });
  }

  async findOne(id: number) {
    const event = await this.eventRepo.findOneBy({ id });
    if (!event) throw new NotFoundException(`Evento #${id} não encontrado`);
    return event;
  }

  async update(
    id: number,
    dto: UpdateEventDto,
    currentUser: CurrentUserPayload,
  ) {
    const event = await this.findOne(id);
    this.assertCanManage(event, currentUser);
    const { organizerIds, bracketType, teamCount, ...rest } = dto;

    const scheduleChanged =
      (rest.date !== undefined &&
        new Date(rest.date).getTime() !== new Date(event.date).getTime()) ||
      (rest.location !== undefined && rest.location !== event.location);

    Object.assign(event, rest);
    if (organizerIds) {
      event.organizers = await this.userService.findByIds(organizerIds);
    }
    if (bracketType && !event.tournamentBracket) {
      event.tournamentBracket = await this.bracketRepository.save(
        this.bracketRepository.create({
          name: `${event.title} - Bracket`,
          type: bracketType,
          teamCount: teamCount ?? 2,
        }),
      );
    }
    const saved = await this.eventRepo.save(event);

    if (scheduleChanged) {
      await this.notificationService.notifyUsers(
        await this.registeredUserIds(id),
        {
          type: 'event_updated',
          title: `Evento alterado: ${saved.title}`,
          message: `Agora: ${this.describe(saved)}`,
          link: `/evento/${saved.id}`,
          critical: true,
        },
      );
    }

    return saved;
  }

  async remove(id: number, currentUser: CurrentUserPayload) {
    const event = await this.findOne(id);
    this.assertCanManage(event, currentUser);
    const photos = await this.photoRepo.find({ where: { event: { id } } });
    await Promise.all(photos.map((p) => this.storage.remove(p.key)));
    return this.eventRepo.delete(id);
  }

  // ---------- Repositório de fotos ----------

  listPhotos(eventId: number) {
    return this.photoRepo.find({
      where: { event: { id: eventId } },
      order: { createdAt: 'DESC' },
    });
  }

  async addPhotos(
    eventId: number,
    files: Express.Multer.File[],
    currentUser: CurrentUserPayload,
  ) {
    const event = await this.findOne(eventId);
    const participants = await this.registeredUserIds(eventId);

    if (
      !this.isManager(event, currentUser) &&
      !participants.includes(currentUser.id)
    ) {
      throw new ForbiddenException(
        'Somente participantes e organizadores podem enviar fotos deste evento',
      );
    }

    const photos: EventPhoto[] = [];
    for (const file of files) {
      const stored = await this.storage.upload(file, `events/${eventId}`);
      photos.push(
        await this.photoRepo.save(
          this.photoRepo.create({
            event: { id: eventId } as Event,
            uploadedBy: { id: currentUser.id } as User,
            ...stored,
          }),
        ),
      );
    }

    await this.notificationService.notifyUsers(
      participants.filter((id) => id !== currentUser.id),
      {
        type: 'event_photo',
        title: `Novas fotos em ${event.title}`,
        message: `${files.length} foto(s) adicionada(s) ao repositório do evento`,
        link: `/evento/${eventId}`,
      },
    );

    return photos;
  }

  async removePhoto(
    eventId: number,
    photoId: number,
    currentUser: CurrentUserPayload,
  ) {
    const event = await this.findOne(eventId);
    const photo = await this.photoRepo.findOne({
      where: { id: photoId, event: { id: eventId } },
    });
    if (!photo) throw new NotFoundException(`Foto #${photoId} não encontrada`);

    if (photo.uploadedBy?.id !== currentUser.id) {
      this.assertCanManage(event, currentUser);
    }

    await this.storage.remove(photo.key);
    return this.photoRepo.delete(photoId);
  }
}

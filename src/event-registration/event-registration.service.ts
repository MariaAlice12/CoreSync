import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { EventRegistration } from './entities/event-registration.entity';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { UpdateEventRegistrationDto } from './dto/update-event-registration.dto';
import { UserService } from 'src/user/user.service';
import { EventService } from 'src/event/event.service';
import { CurrentUserPayload } from 'src/auth/decorators/current-user.decorator';

@Injectable()
export class EventRegistrationService {
  constructor(
    @InjectRepository(EventRegistration)
    private registrationRepo: Repository<EventRegistration>,
    private userService: UserService,
    private eventService: EventService,
  ) {}

  private assertCanManage(
    reg: EventRegistration,
    currentUser: CurrentUserPayload,
  ) {
    const event = reg.event;
    const isManager =
      currentUser.userType === 'admin' ||
      event.user?.id === currentUser.id ||
      event.organizers?.some((o) => o.id === currentUser.id);
    if (!isManager && reg.user.id !== currentUser.id) {
      throw new ForbiddenException('Você não pode alterar esta inscrição');
    }
  }

  async create(
    dto: CreateEventRegistrationDto,
    currentUser: CurrentUserPayload,
  ) {
    const userId =
      currentUser.userType === 'aluno' || !dto.userId
        ? currentUser.id
        : dto.userId;
    const user = await this.userService.findOne(userId);
    const event = await this.eventService.findOne(dto.eventId);

    const existing = await this.registrationRepo.findOne({
      where: { user: { id: userId }, event: { id: event.id } },
    });
    if (existing?.active) {
      throw new ConflictException('Usuário já está inscrito neste evento');
    }
    if (existing) {
      existing.active = true;
      return this.registrationRepo.save(existing);
    }

    const registration = this.registrationRepo.create({
      user,
      event,
      active: dto.active ?? true,
    });
    return this.registrationRepo.save(registration);
  }

  findAll(eventId?: number) {
    const where: FindOptionsWhere<EventRegistration> = {};
    if (eventId) where.event = { id: eventId };
    return this.registrationRepo.find({ where });
  }

  findForUser(userId: number) {
    return this.registrationRepo.find({ where: { user: { id: userId } } });
  }

  async findOne(id: number) {
    const reg = await this.registrationRepo.findOne({ where: { id } });
    if (!reg) throw new NotFoundException(`Inscrição #${id} não encontrada`);
    return reg;
  }

  async update(
    id: number,
    dto: UpdateEventRegistrationDto,
    currentUser: CurrentUserPayload,
  ) {
    const reg = await this.findOne(id);
    this.assertCanManage(reg, currentUser);
    if (dto.active !== undefined) reg.active = dto.active;
    return this.registrationRepo.save(reg);
  }

  async remove(id: number, currentUser: CurrentUserPayload) {
    const reg = await this.findOne(id);
    this.assertCanManage(reg, currentUser);
    return this.registrationRepo.delete(id);
  }
}

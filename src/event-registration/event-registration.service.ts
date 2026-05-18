import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventRegistration } from './entities/event-registration.entity';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { UpdateEventRegistrationDto } from './dto/update-event-registration.dto';
import { UserService } from 'src/user/user.service';
import { EventService } from 'src/event/event.service';

@Injectable()
export class EventRegistrationService {
  constructor(
    @InjectRepository(EventRegistration)
    private registrationRepo: Repository<EventRegistration>,
    private userService: UserService,
    private eventService: EventService,
  ) {}

  async create(dto: CreateEventRegistrationDto) {
    const user = await this.userService.findOne(dto.userId);
    const event = await this.eventService.findOne(dto.eventId);
    const registration = this.registrationRepo.create({ ...dto, user, event });
    return this.registrationRepo.save(registration);
  }

  findAll() {
    return this.registrationRepo.find();
  }

  async findOne(id: number) {
    const reg = await this.registrationRepo.findOne({ where: { id } });
    if (!reg) throw new NotFoundException(`Inscrição #${id} não encontrada`);
    return reg;
  }

  async update(id: number, dto: UpdateEventRegistrationDto) {
    await this.findOne(id);
    return this.registrationRepo.update(id, dto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.registrationRepo.delete(id);
  }
}

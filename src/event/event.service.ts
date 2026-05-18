import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TournamentBracket } from 'src/tournament-bracket/entities/tournament-bracket.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,

    @InjectRepository(TournamentBracket)
    private bracketRepository: Repository<TournamentBracket>,
  ) {}

  async create(dto: CreateEventDto): Promise<Event> {
    const event = this.eventRepo.create(dto);

    if (dto.bracketType) {
      const bracket = this.bracketRepository.create({
        name: `${dto.title} - Bracket`,
        type: dto.bracketType,
        teamCount: dto.teamCount ?? 2,
      });
      event.tournamentBracket = await this.bracketRepository.save(bracket);
    }

    return this.eventRepo.save(event);
  }

  findAll() {
    return this.eventRepo.find();
  }

  async findOne(id: number) {
    const event = await this.eventRepo.findOneBy({ id });
    if (!event) throw new NotFoundException(`Evento #${id} não encontrado`);
    return event;
  }

  async update(id: number, dto: UpdateEventDto) {
    await this.findOne(id);
    return this.eventRepo.update(id, dto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.eventRepo.delete(id);
  }
}

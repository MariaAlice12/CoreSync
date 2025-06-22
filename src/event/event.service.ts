import { Injectable } from '@nestjs/common';
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

 async createEvent(dto: CreateEventDto): Promise<Event> {
    const event = this.eventRepo.create(dto);

    // ✅ Lógica de criação da chave (tournament bracket)
    if (dto.bracketGenerated) {
      const bracket = new TournamentBracket();
      bracket.name = `${dto.title} - Bracket`;

      const savedBracket = await this.bracketRepository.save(bracket);
      event.tournamentBracket = savedBracket;
    }

    return this.eventRepo.save(event);
  }


 create(dto: CreateEventDto) {
    const event = this.eventRepo.create(dto);
    return this.eventRepo.save(event);
  }

  findAll() {
    return this.eventRepo.find();
  }

  findOne(id: number) {
    return this.eventRepo.findOneBy({ id });
  }

  update(id: number, dto: UpdateEventDto) {
    return this.eventRepo.update(id, dto);
  }

  remove(id: number) {
    return this.eventRepo.delete(id);
  }
}

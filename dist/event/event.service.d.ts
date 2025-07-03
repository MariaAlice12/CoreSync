import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { Repository } from 'typeorm';
import { TournamentBracket } from 'src/tournament-bracket/entities/tournament-bracket.entity';
export declare class EventService {
    private eventRepo;
    private bracketRepository;
    constructor(eventRepo: Repository<Event>, bracketRepository: Repository<TournamentBracket>);
    createEvent(dto: CreateEventDto): Promise<Event>;
    create(dto: CreateEventDto): Promise<Event>;
    findAll(): Promise<Event[]>;
    findOne(id: number): Promise<Event>;
    update(id: number, dto: UpdateEventDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}

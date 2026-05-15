import { Repository } from 'typeorm';
import { TournamentBracket } from './entities/tournament-bracket.entity';
import { CreateTournamentBracketDto } from './dto/create-tournament-bracket.dto';
import { UpdateTournamentBracketDto } from './dto/update-tournament-bracket.dto';
export declare class TournamentBracketService {
    private readonly bracketRepo;
    constructor(bracketRepo: Repository<TournamentBracket>);
    create(dto: CreateTournamentBracketDto): Promise<TournamentBracket>;
    findAll(): Promise<TournamentBracket[]>;
    findOne(id: string): Promise<TournamentBracket>;
    update(id: string, dto: UpdateTournamentBracketDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}

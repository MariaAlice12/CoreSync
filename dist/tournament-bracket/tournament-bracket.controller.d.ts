import { TournamentBracketService } from './tournament-bracket.service';
import { CreateTournamentBracketDto } from './dto/create-tournament-bracket.dto';
import { UpdateTournamentBracketDto } from './dto/update-tournament-bracket.dto';
export declare class TournamentBracketController {
    private readonly tournamentBracketService;
    constructor(tournamentBracketService: TournamentBracketService);
    create(createTournamentBracketDto: CreateTournamentBracketDto): Promise<import("./entities/tournament-bracket.entity").TournamentBracket>;
    findAll(): Promise<import("./entities/tournament-bracket.entity").TournamentBracket[]>;
    findOne(id: string): Promise<import("./entities/tournament-bracket.entity").TournamentBracket>;
    update(id: string, updateTournamentBracketDto: UpdateTournamentBracketDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}

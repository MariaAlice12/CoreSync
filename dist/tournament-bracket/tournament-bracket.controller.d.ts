import { TournamentBracketService } from './tournament-bracket.service';
import { CreateTournamentBracketDto } from './dto/create-tournament-bracket.dto';
import { UpdateTournamentBracketDto } from './dto/update-tournament-bracket.dto';
export declare class TournamentBracketController {
    private readonly tournamentBracketService;
    constructor(tournamentBracketService: TournamentBracketService);
    create(createTournamentBracketDto: CreateTournamentBracketDto): {
        name: string;
        type: import("./dto/create-tournament-bracket.dto").BracketType;
        teamCount: number;
        id: number;
    };
    findAll(): any[];
    findOne(id: string): any;
    update(id: string, updateTournamentBracketDto: UpdateTournamentBracketDto): any;
    remove(id: string): any;
}

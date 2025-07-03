import { CreateTournamentBracketDto } from './dto/create-tournament-bracket.dto';
import { UpdateTournamentBracketDto } from './dto/update-tournament-bracket.dto';
export declare class TournamentBracketService {
    private brackets;
    private idCounter;
    create(dto: CreateTournamentBracketDto): {
        name: string;
        type: import("./dto/create-tournament-bracket.dto").BracketType;
        teamCount: number;
        id: number;
    };
    findAll(): any[];
    findOne(id: number): any;
    update(id: number, dto: UpdateTournamentBracketDto): any;
    remove(id: number): any;
}

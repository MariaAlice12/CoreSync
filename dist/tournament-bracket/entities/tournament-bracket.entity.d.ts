import { BracketType } from '../dto/create-tournament-bracket.dto';
export declare class TournamentBracket {
    id: string;
    name: string;
    type: BracketType;
    teamCount: number;
    createdAt: Date;
    updatedAt: Date;
}

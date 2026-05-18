import { BracketType } from 'src/tournament-bracket/dto/create-tournament-bracket.dto';
export declare class CreateEventDto {
    title: string;
    description: string;
    image?: string;
    date?: string;
    bracketType?: BracketType;
    teamCount?: number;
}

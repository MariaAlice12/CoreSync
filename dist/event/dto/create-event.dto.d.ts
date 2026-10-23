import { BracketType } from 'src/tournament-bracket/dto/create-tournament-bracket.dto';
export declare class CreateEventDto {
    title: string;
    description: string;
    image?: string;
    date?: string;
    location?: string;
    organizerIds?: number[];
    bracketType?: BracketType;
    teamCount?: number;
}

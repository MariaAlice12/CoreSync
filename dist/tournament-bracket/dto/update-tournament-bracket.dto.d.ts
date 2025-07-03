import { CreateTournamentBracketDto } from './create-tournament-bracket.dto';
import { BracketType } from './create-tournament-bracket.dto';
declare const UpdateTournamentBracketDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateTournamentBracketDto>>;
export declare class UpdateTournamentBracketDto extends UpdateTournamentBracketDto_base {
    name: string;
    type: BracketType;
    teamCount: number;
}
export {};

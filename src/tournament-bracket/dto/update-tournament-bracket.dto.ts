import { PartialType } from '@nestjs/mapped-types';
import { CreateTournamentBracketDto } from './create-tournament-bracket.dto';

export class UpdateTournamentBracketDto extends PartialType(CreateTournamentBracketDto) {}

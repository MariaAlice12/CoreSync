import { IsString, IsEnum, IsInt, Min } from 'class-validator';

export enum BracketType {
  SINGLE_ELIMINATION = 'single',
  DOUBLE_ELIMINATION = 'double',
  ROUND_ROBIN = 'round-robin',
}

export class CreateTournamentBracketDto {
  @IsString()
  name: string;

  @IsEnum(BracketType)
  type: BracketType;

  @IsInt()
  @Min(2)
  teamCount: number;
}
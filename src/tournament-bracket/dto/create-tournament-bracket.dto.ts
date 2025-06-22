import { IsString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum BracketType {
  SINGLE_ELIMINATION = 'single',
  DOUBLE_ELIMINATION = 'double',
  ROUND_ROBIN = 'round-robin',
}

export class CreateTournamentBracketDto {
  @ApiProperty({ type: String })
  @IsString()
  name: string;

  @ApiProperty({ type: String })
  @IsEnum(BracketType)
  type: BracketType;

  @ApiProperty({ type: Number })
  @IsInt()
  @Min(2)
  teamCount: number;
}
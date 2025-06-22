import { PartialType } from '@nestjs/mapped-types';
import { CreateTournamentBracketDto } from './create-tournament-bracket.dto';
import { ApiProperty } from '@nestjs/swagger';
import { BracketType } from './create-tournament-bracket.dto';
import { IsString, IsEnum, IsInt, Min } from 'class-validator';

export class UpdateTournamentBracketDto extends PartialType(CreateTournamentBracketDto) {

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

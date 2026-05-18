import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { BracketType } from 'src/tournament-bracket/dto/create-tournament-bracket.dto';

export class CreateEventDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ enum: BracketType, required: false })
  @IsOptional()
  @IsEnum(BracketType)
  bracketType?: BracketType;

  @ApiProperty({ type: Number, required: false, minimum: 2 })
  @IsOptional()
  @IsInt()
  @Min(2)
  teamCount?: number;
}

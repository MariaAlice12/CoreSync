import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
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

  @ApiProperty({
    type: String,
    required: false,
    description: 'Data e horário (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Local do evento',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    type: [Number],
    required: false,
    description: 'IDs dos organizadores (padrão: quem criou o evento)',
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  organizerIds?: number[];

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

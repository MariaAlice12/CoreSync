import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateTrainingDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  modality: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  hour: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  weekdays: string[];

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: Boolean, default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({ type: Number })
  @IsInt()
  @Min(1)
  maxStudents: number;

  @ApiProperty({ type: Number })
  @IsInt()
  @Min(1)
  minStudents: number;

  @ApiProperty({
    type: Number,
    required: false,
    description:
      'Obrigatório quando o criador é admin; ignorado quando o criador é professor (auto-atribuído)',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  professorId?: number;
}

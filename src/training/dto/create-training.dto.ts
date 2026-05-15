import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
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

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  weekday: string;

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
}

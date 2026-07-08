import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateSurveyResponseDto {
  @ApiProperty({ type: Number })
  @IsInt()
  @IsPositive()
  trainingId: number;

  @ApiProperty({ type: Number, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}

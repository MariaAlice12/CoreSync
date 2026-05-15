import { IsInt, IsBoolean, IsPositive, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty({ type: Number })
  @IsInt()
  @IsPositive()
  trainingId: number;

  @ApiProperty({ type: Number })
  @IsInt()
  @IsPositive()
  userId: number;

  @ApiProperty({ type: Boolean, default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

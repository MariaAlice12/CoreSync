import { IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {

  @ApiProperty({ type: Number })
  trainingId: number;

  @ApiProperty({ type: Number })
  userId: number;

  @ApiProperty({ type: Boolean })
  active: boolean;
}

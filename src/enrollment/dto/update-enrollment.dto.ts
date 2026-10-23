import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateEnrollmentDto {
  @ApiProperty({ type: Boolean })
  @IsBoolean()
  active: boolean;
}

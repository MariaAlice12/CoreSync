import { PartialType } from '@nestjs/mapped-types';
import { CreateEnrollmentDto } from './create-enrollment.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEnrollmentDto extends PartialType(CreateEnrollmentDto) {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Boolean })
  active: boolean;
}

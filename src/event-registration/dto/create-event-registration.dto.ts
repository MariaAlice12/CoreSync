import { IsInt, IsPositive, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventRegistrationDto {
  @ApiProperty({ type: Number })
  @IsInt()
  @IsPositive()
  eventId: number;

  @ApiProperty({ type: Number })
  @IsInt()
  @IsPositive()
  userId: number;

  @ApiProperty({ type: Boolean, default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

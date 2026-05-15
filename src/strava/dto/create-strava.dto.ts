// src/strava/dto/create-strava.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class CreateStravaDto {
  @ApiProperty({ type: String })
  stravaId: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: Number })
  distance: number;

  @ApiProperty({ type: Number })
  movingTime: number;

  @ApiProperty({ type: Number })
  elapsedTime: number;

  @ApiProperty({ type: Number })
  totalElevationGain: number;

  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: String })
  sportType?: string;

  @ApiProperty({ type: Number })
  averageSpeed?: number;

  @ApiProperty({ type: Number })
  maxSpeed?: number;

  @ApiProperty({ type: Date })
  startDate: Date;
}

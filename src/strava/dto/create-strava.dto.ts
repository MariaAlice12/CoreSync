// src/strava/dto/create-strava.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class CreateStravaDto {
  @ApiProperty({ type: String })
  stravaId: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: Number, description: 'metros' })
  distance: number;

  @ApiProperty({ type: Number, description: 'segundos' })
  movingTime: number;

  @ApiProperty({ type: Number, description: 'segundos' })
  elapsedTime: number;

  @ApiProperty({ type: Number })
  totalElevationGain: number;

  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: String })
  sportType?: string;

  @ApiProperty({ type: Number, description: 'm/s' })
  averageSpeed?: number;

  @ApiProperty({ type: Number, description: 'm/s' })
  maxSpeed?: number;

  @ApiProperty({ type: Number, required: false, description: 'bpm' })
  averageHeartrate?: number | null;

  @ApiProperty({ type: Number, required: false, description: 'bpm' })
  maxHeartrate?: number | null;

  @ApiProperty({ type: Number, required: false })
  averageCadence?: number | null;

  @ApiProperty({ type: Date })
  startDate: Date;
}

export class StravaActivityDto extends CreateStravaDto {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Ritmo médio em segundos por km (null sem distância)',
  })
  pace: number | null;
}

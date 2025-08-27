// src/strava/strava.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Strava } from './entities/strava.entity';
import { CreateStravaDto } from './dto/create-strava.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class StravaService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Strava)
    private readonly activityRepo: Repository<Strava>,
  ) {}

  private readonly baseUrl = 'https://www.strava.com/api/v3';

  private accessToken = process.env.STRAVA_ACCESS_TOKEN;
  private refreshToken = process.env.STRAVA_REFRESH_TOKEN;
  private clientId = process.env.STRAVA_CLIENT_ID;
  private clientSecret = process.env.STRAVA_CLIENT_SECRET;
  private expiresAt = Number(process.env.STRAVA_EXPIRES_AT) || 0;

  // 👉 Coloca aqui dentro do service
  private async ensureAccessToken() {
    const now = Math.floor(Date.now() / 1000);

    if (now >= this.expiresAt) {
      const response = await firstValueFrom(
        this.httpService.post('https://www.strava.com/oauth/token', {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        }),
      );

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.expiresAt = response.data.expires_at;

      console.log('Novo access token:', this.accessToken);
    }

    return this.accessToken;
  }

  async findAll(): Promise<Strava[]> {
    return this.activityRepo.find();
  }

  async syncActivities(perPage = 5) {
    const token = await this.ensureAccessToken(); // 👈 usa o método aqui

    const response = await firstValueFrom<AxiosResponse<any>>(
      this.httpService.get(`${this.baseUrl}/athlete/activities?per_page=${perPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    );

    const activities = response.data;

    for (const act of activities) {
      const exists = await this.activityRepo.findOne({ where: { stravaId: act.id } });
      if (!exists) {
        const dto: CreateStravaDto = {
          stravaId: act.id,
          name: act.name,
          distance: act.distance,
          movingTime: act.moving_time,
          elapsedTime: act.elapsed_time,
          totalElevationGain: act.total_elevation_gain,
          type: act.type,
          sportType: act.sport_type,
          averageSpeed: act.average_speed,
          maxSpeed: act.max_speed,
          startDate: new Date(act.start_date),
        };
        await this.activityRepo.save(dto);
      }
    }

    return this.activityRepo.find();
  }
}

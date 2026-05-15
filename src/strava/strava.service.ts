import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Strava } from './entities/strava.entity';
import { CreateStravaDto } from './dto/create-strava.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface StravaActivityData {
  id: number; // Strava returns numeric IDs; stored as string to handle large values
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  average_speed: number;
  max_speed: number;
  start_date: string;
}

@Injectable()
export class StravaService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Strava)
    private readonly activityRepo: Repository<Strava>,
  ) {}

  private readonly baseUrl = 'https://www.strava.com/api/v3';

  private accessToken: string = process.env.STRAVA_ACCESS_TOKEN ?? '';
  private refreshToken: string = process.env.STRAVA_REFRESH_TOKEN ?? '';
  private readonly clientId: string = process.env.STRAVA_CLIENT_ID ?? '';
  private readonly clientSecret: string =
    process.env.STRAVA_CLIENT_SECRET ?? '';
  private expiresAt: number = Number(process.env.STRAVA_EXPIRES_AT) || 0;

  private async ensureAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    if (now >= this.expiresAt) {
      const response = await firstValueFrom(
        this.httpService.post<{
          access_token: string;
          refresh_token: string;
          expires_at: number;
        }>('https://www.strava.com/oauth/token', {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        }),
      );

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.expiresAt = response.data.expires_at;
    }

    return this.accessToken;
  }

  async findAll(): Promise<Strava[]> {
    return this.activityRepo.find();
  }

  async syncActivities(perPage = 5): Promise<Strava[]> {
    const token = await this.ensureAccessToken();

    const response = await firstValueFrom(
      this.httpService.get<StravaActivityData[]>(
        `${this.baseUrl}/athlete/activities?per_page=${perPage}`,
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );

    for (const act of response.data) {
      const exists = await this.activityRepo.findOne({
        where: { stravaId: act.id.toString() },
      });
      if (!exists) {
        const dto: CreateStravaDto = {
          stravaId: act.id.toString(),
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

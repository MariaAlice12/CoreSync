import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Strava } from './entities/strava.entity';
import { StravaAccount } from './entities/strava-account.entity';
import { StravaActivityDto } from './dto/create-strava.dto';
import { User } from 'src/user/entities/user.entity';

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
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  start_date: string;
}

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: { id: number; firstname?: string; lastname?: string };
}

const STRAVA_OAUTH_URL = 'https://www.strava.com/oauth';

@Injectable()
export class StravaService {
  private readonly logger = new Logger(StravaService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    @InjectRepository(Strava)
    private readonly activityRepo: Repository<Strava>,
    @InjectRepository(StravaAccount)
    private readonly accountRepo: Repository<StravaAccount>,
  ) {}

  private readonly baseUrl = 'https://www.strava.com/api/v3';
  private readonly clientId: string = process.env.STRAVA_CLIENT_ID ?? '';
  private readonly clientSecret: string =
    process.env.STRAVA_CLIENT_SECRET ?? '';
  private readonly redirectUri: string =
    process.env.STRAVA_REDIRECT_URI ??
    `${process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 8080}`}/strava/callback`;

  frontendUrl(path: string) {
    const base = (process.env.FRONTEND_URL ?? 'http://localhost:5173').split(
      ',',
    )[0];
    return `${base}${path}`;
  }

  // ---------- OAuth ----------

  getAuthorizeUrl(userId: number) {
    if (!this.clientId) {
      throw new BadRequestException(
        'Integração com Strava não configurada (defina STRAVA_CLIENT_ID e STRAVA_CLIENT_SECRET)',
      );
    }
    const state = this.jwtService.sign(
      { sub: userId, purpose: 'strava' },
      { expiresIn: '10m' },
    );
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      approval_prompt: 'auto',
      scope: 'read,activity:read_all',
      state,
    });
    return `${STRAVA_OAUTH_URL}/authorize?${params.toString()}`;
  }

  async handleCallback(code: string, state: string, scope?: string) {
    let userId: number;
    try {
      const payload = this.jwtService.verify<{ sub: number; purpose: string }>(
        state,
      );
      if (payload.purpose !== 'strava') throw new Error('purpose');
      userId = payload.sub;
    } catch {
      throw new UnauthorizedException('Estado OAuth inválido ou expirado');
    }

    const { data } = await firstValueFrom(
      this.httpService.post<StravaTokenResponse>(`${STRAVA_OAUTH_URL}/token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    );

    const account =
      (await this.accountRepo.findOne({ where: { user: { id: userId } } })) ??
      this.accountRepo.create({ user: { id: userId } as User });

    Object.assign(account, {
      athleteId: String(data.athlete?.id ?? ''),
      athleteName: data.athlete
        ? [data.athlete.firstname, data.athlete.lastname]
            .filter(Boolean)
            .join(' ')
        : null,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      scope: scope ?? null,
    });
    await this.accountRepo.save(account);
    return account;
  }

  async status(userId: number) {
    const account = await this.accountRepo.findOne({
      where: { user: { id: userId } },
    });
    return {
      configured: !!this.clientId,
      connected: !!account,
      athleteName: account?.athleteName ?? null,
      connectedAt: account?.createdAt ?? null,
    };
  }

  async disconnect(userId: number) {
    const account = await this.accountRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!account) return { connected: false };

    try {
      const token = await this.ensureAccessToken(account);
      await firstValueFrom(
        this.httpService.post(`${STRAVA_OAUTH_URL}/deauthorize`, null, {
          params: { access_token: token },
        }),
      );
    } catch (err) {
      // Mesmo se o Strava falhar, removemos o vínculo local.
      this.logger.warn(`Falha ao revogar acesso no Strava: ${String(err)}`);
    }
    await this.accountRepo.delete(account.id);
    return { connected: false };
  }

  private async ensureAccessToken(account: StravaAccount): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    // Renova com 1 minuto de folga antes de expirar.
    if (now >= account.expiresAt - 60) {
      const response = await firstValueFrom(
        this.httpService.post<StravaTokenResponse>(
          `${STRAVA_OAUTH_URL}/token`,
          {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: account.refreshToken,
          },
        ),
      );

      account.accessToken = response.data.access_token;
      account.refreshToken = response.data.refresh_token;
      account.expiresAt = response.data.expires_at;
      await this.accountRepo.save(account);
    }

    return account.accessToken;
  }

  // ---------- Atividades ----------

  static toDto(activity: Strava): StravaActivityDto {
    const { id, stravaId, name, distance, movingTime, elapsedTime } = activity;
    return {
      id,
      stravaId,
      name,
      distance,
      movingTime,
      elapsedTime,
      totalElevationGain: activity.totalElevationGain,
      type: activity.type,
      sportType: activity.sportType,
      averageSpeed: activity.averageSpeed,
      maxSpeed: activity.maxSpeed,
      averageHeartrate: activity.averageHeartrate,
      maxHeartrate: activity.maxHeartrate,
      averageCadence: activity.averageCadence,
      startDate: activity.startDate,
      pace:
        activity.distance > 0
          ? activity.movingTime / (activity.distance / 1000)
          : null,
    };
  }

  async findForUser(userId: number): Promise<StravaActivityDto[]> {
    const activities = await this.activityRepo.find({
      where: { user: { id: userId } },
      order: { startDate: 'DESC' },
    });
    return activities.map(StravaService.toDto);
  }

  async syncActivities(
    userId: number,
    perPage = 30,
  ): Promise<StravaActivityDto[]> {
    const account = await this.accountRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!account) {
      throw new BadRequestException(
        'Conecte sua conta do Strava antes de sincronizar',
      );
    }
    const token = await this.ensureAccessToken(account);

    const response = await firstValueFrom(
      this.httpService.get<StravaActivityData[]>(
        `${this.baseUrl}/athlete/activities`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { per_page: Math.min(Math.max(perPage, 1), 200) },
        },
      ),
    );

    for (const act of response.data) {
      const existing = await this.activityRepo.findOne({
        where: { stravaId: act.id.toString() },
      });
      await this.activityRepo.save({
        ...(existing ?? {}),
        user: { id: userId } as User,
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
        averageHeartrate: act.average_heartrate ?? null,
        maxHeartrate: act.max_heartrate ?? null,
        averageCadence: act.average_cadence ?? null,
        startDate: new Date(act.start_date),
      });
    }

    return this.findForUser(userId);
  }
}

import { Repository } from 'typeorm';
import { Strava } from './entities/strava.entity';
import { HttpService } from '@nestjs/axios';
export declare class StravaService {
    private readonly httpService;
    private readonly activityRepo;
    constructor(httpService: HttpService, activityRepo: Repository<Strava>);
    private readonly baseUrl;
    private accessToken;
    private refreshToken;
    private readonly clientId;
    private readonly clientSecret;
    private expiresAt;
    private ensureAccessToken;
    findAll(): Promise<Strava[]>;
    syncActivities(perPage?: number): Promise<Strava[]>;
}

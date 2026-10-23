import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { Strava } from './entities/strava.entity';
import { StravaAccount } from './entities/strava-account.entity';
import { StravaActivityDto } from './dto/create-strava.dto';
export declare class StravaService {
    private readonly httpService;
    private readonly jwtService;
    private readonly activityRepo;
    private readonly accountRepo;
    private readonly logger;
    constructor(httpService: HttpService, jwtService: JwtService, activityRepo: Repository<Strava>, accountRepo: Repository<StravaAccount>);
    private readonly baseUrl;
    private readonly clientId;
    private readonly clientSecret;
    private readonly redirectUri;
    frontendUrl(path: string): string;
    getAuthorizeUrl(userId: number): string;
    handleCallback(code: string, state: string, scope?: string): Promise<StravaAccount>;
    status(userId: number): Promise<{
        configured: boolean;
        connected: boolean;
        athleteName: string | null;
        connectedAt: Date | null;
    }>;
    disconnect(userId: number): Promise<{
        connected: boolean;
    }>;
    private ensureAccessToken;
    static toDto(activity: Strava): StravaActivityDto;
    findForUser(userId: number): Promise<StravaActivityDto[]>;
    syncActivities(userId: number, perPage?: number): Promise<StravaActivityDto[]>;
}

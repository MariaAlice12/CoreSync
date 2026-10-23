import { Response } from 'express';
import { StravaService } from './strava.service';
import { StravaActivityDto } from './dto/create-strava.dto';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
export declare class StravaController {
    private readonly stravaService;
    constructor(stravaService: StravaService);
    connect(user: CurrentUserPayload): {
        url: string;
    };
    callback(res: Response, code?: string, state?: string, scope?: string, error?: string): Promise<void>;
    status(user: CurrentUserPayload): Promise<{
        configured: boolean;
        connected: boolean;
        athleteName: string | null;
        connectedAt: Date | null;
    }>;
    disconnect(user: CurrentUserPayload): Promise<{
        connected: boolean;
    }>;
    syncActivities(user: CurrentUserPayload, perPage?: string): Promise<StravaActivityDto[]>;
    findMine(user: CurrentUserPayload): Promise<StravaActivityDto[]>;
    findForUser(id: number): Promise<StravaActivityDto[]>;
}

import { StravaService } from './strava.service';
import { CreateStravaDto } from './dto/create-strava.dto';
export declare class StravaController {
    private readonly stravaService;
    constructor(stravaService: StravaService);
    syncActivities(perPage: number): Promise<CreateStravaDto[]>;
    findAll(): Promise<CreateStravaDto[]>;
}

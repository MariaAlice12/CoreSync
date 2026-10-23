import { User } from 'src/user/entities/user.entity';
export declare class Strava {
    id: number;
    user: User | null;
    stravaId: string;
    name: string;
    distance: number;
    movingTime: number;
    elapsedTime: number;
    totalElevationGain: number;
    type: string;
    sportType: string;
    averageSpeed: number;
    maxSpeed: number;
    averageHeartrate: number | null;
    maxHeartrate: number | null;
    averageCadence: number | null;
    startDate: Date;
    createdAt: Date;
}

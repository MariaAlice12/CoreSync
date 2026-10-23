export declare class CreateStravaDto {
    stravaId: string;
    name: string;
    distance: number;
    movingTime: number;
    elapsedTime: number;
    totalElevationGain: number;
    type: string;
    sportType?: string;
    averageSpeed?: number;
    maxSpeed?: number;
    averageHeartrate?: number | null;
    maxHeartrate?: number | null;
    averageCadence?: number | null;
    startDate: Date;
}
export declare class StravaActivityDto extends CreateStravaDto {
    id: number;
    pace: number | null;
}

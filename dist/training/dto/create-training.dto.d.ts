export declare class CreateTrainingDto {
    modality: string;
    hour: string;
    address: string;
    weekdays: string[];
    description?: string;
    active?: boolean;
    maxStudents: number;
    minStudents: number;
}

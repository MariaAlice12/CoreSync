import { NivelTreino } from '../entities/training.entity';
export declare class CreateTrainingDto {
    modality: string;
    hour: string;
    address: string;
    weekdays: string[];
    description?: string;
    active?: boolean;
    level?: NivelTreino;
    campus?: string;
    maxStudents: number;
    minStudents: number;
    professorId?: number;
}

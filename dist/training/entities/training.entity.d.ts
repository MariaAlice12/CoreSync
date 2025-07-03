import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
export declare class Training {
    id: number;
    modality: string;
    hour: string;
    adress: string;
    weekday: string;
    description: string;
    atictive: boolean;
    maxStudents: number;
    minStudents: number;
    enrollments: Enrollment[];
    createdAt: Date;
    updatedAt: Date;
}

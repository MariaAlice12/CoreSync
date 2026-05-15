import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
export declare class Training {
    id: number;
    modality: string;
    hour: string;
    address: string;
    weekdays: string[];
    description: string;
    active: boolean;
    maxStudents: number;
    minStudents: number;
    enrollments: Enrollment[];
    createdAt: Date;
    updatedAt: Date;
}

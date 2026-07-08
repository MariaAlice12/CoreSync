import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { User } from 'src/user/entities/user.entity';
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
    professor: User | null;
    enrollments: Enrollment[];
    createdAt: Date;
    updatedAt: Date;
}

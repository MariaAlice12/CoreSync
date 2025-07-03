import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Event } from 'src/event/entities/event.entity';
export declare class User {
    id: number;
    name: string;
    userType: TipoUser;
    telephone: string;
    email: string;
    password: string;
    enrollments: Enrollment[];
    events: Event[];
    createdAt: Date;
    updatedAt: Date;
}
export type TipoUser = 'aluno' | 'professor' | 'admin';

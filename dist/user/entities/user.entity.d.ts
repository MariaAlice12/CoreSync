import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
export declare class User {
    id: number;
    name: string;
    userType: TipoUser;
    telephone: string;
    email: string;
    password: string;
    enrollments: Enrollment[];
}
export type TipoUser = 'aluno' | 'professor' | 'admin';

import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
export declare class User {
    id: number;
    nome: string;
    tipoUsuario: TipoUser;
    telefone: string;
    email: string;
    senha: string;
    enrollments: Enrollment[];
}
type TipoUser = 'aluno' | 'professor' | 'admin';
export {};

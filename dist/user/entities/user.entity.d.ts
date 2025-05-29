import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Post } from 'src/post/entities/post.entity';
export declare class User {
    id: number;
    name: string;
    userType: TipoUser;
    telephone: string;
    email: string;
    password: string;
    enrollments: Enrollment[];
    posts: Post[];
}
export type TipoUser = 'aluno' | 'professor' | 'admin';

import { User } from 'src/user/entities/user.entity';
export declare class Post {
    id: number;
    user: User;
    title: string;
    description: string;
    image: string;
    date: Date;
}

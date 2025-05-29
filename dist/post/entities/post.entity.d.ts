import { User } from 'src/user/entities/user.entity';
export declare class Post {
    id: string;
    user: User;
    date: Date;
    description: string;
    image: string;
}

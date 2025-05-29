import { Training } from 'src/training/entities/training.entity';
import { User } from 'src/user/entities/user.entity';
export declare class Enrollment {
    id: number;
    user: User;
    training: Training;
    date: Date;
    active: boolean;
}

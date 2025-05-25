import { Training } from 'src/training/entities/training.entity';
import { User } from 'src/user/entities/user.entity';
export declare class Enrollment {
    id: string;
    user: User;
    training: Training;
    enrollDate: Date;
    active: boolean;
}

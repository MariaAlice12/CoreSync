import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { Training } from './entities/training.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { CurrentUserPayload } from 'src/auth/decorators/current-user.decorator';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { NotificationService } from 'src/notification/notification.service';
export interface TrainingFilters {
    modality?: string;
    level?: string;
    professorId?: number;
    campus?: string;
    active?: boolean;
}
export declare class TrainingService {
    private trainingRepo;
    private enrollmentRepo;
    private readonly userService;
    private readonly notificationService;
    constructor(trainingRepo: Repository<Training>, enrollmentRepo: Repository<Enrollment>, userService: UserService, notificationService: NotificationService);
    private resolveProfessor;
    private assertCanManage;
    create(dto: CreateTrainingDto, currentUser: CurrentUserPayload): Promise<Training>;
    findAll(filters?: TrainingFilters): Promise<Training[]>;
    findOne(id: number): Promise<Training>;
    update(id: number, dto: UpdateTrainingDto, currentUser: CurrentUserPayload): Promise<Training>;
    remove(id: number, currentUser: CurrentUserPayload): Promise<import("typeorm").DeleteResult>;
    activeStudentIds(trainingId: number): Promise<number[]>;
}

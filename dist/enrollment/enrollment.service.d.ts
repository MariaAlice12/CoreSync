import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Enrollment } from './entities/enrollment.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { TrainingService } from 'src/training/training.service';
import { CurrentUserPayload } from 'src/auth/decorators/current-user.decorator';
export interface EnrollmentFilters {
    trainingId?: number;
    course?: string;
    shift?: string;
    active?: boolean;
}
export declare class EnrollmentService {
    private enrollmentRepo;
    private userService;
    private trainingService;
    constructor(enrollmentRepo: Repository<Enrollment>, userService: UserService, trainingService: TrainingService);
    private assertHasVacancy;
    private assertCanManage;
    create(dto: CreateEnrollmentDto, currentUser: CurrentUserPayload): Promise<Enrollment>;
    findAll(currentUser: CurrentUserPayload, filters?: EnrollmentFilters): Promise<Enrollment[]>;
    findForUser(userId: number): Promise<Enrollment[]>;
    findOne(id: number): Promise<Enrollment>;
    update(id: number, dto: UpdateEnrollmentDto, currentUser: CurrentUserPayload): Promise<Enrollment>;
    remove(id: number, currentUser: CurrentUserPayload): Promise<import("typeorm").DeleteResult>;
    existsForUserAndTraining(userId: number, trainingId: number): Promise<boolean>;
    isActivelyEnrolled(userId: number, trainingId: number): Promise<boolean>;
}

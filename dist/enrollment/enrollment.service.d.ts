import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Enrollment } from './entities/enrollment.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { TrainingService } from 'src/training/training.service';
export declare class EnrollmentService {
    private enrollmentRepo;
    private userService;
    private trainingService;
    constructor(enrollmentRepo: Repository<Enrollment>, userService: UserService, trainingService: TrainingService);
    create(dto: CreateEnrollmentDto): Promise<Enrollment>;
    findAll(): Promise<Enrollment[]>;
    findOne(id: number): Promise<Enrollment>;
    update(id: number, dto: UpdateEnrollmentDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
    existsForUserAndTraining(userId: number, trainingId: number): Promise<boolean>;
}

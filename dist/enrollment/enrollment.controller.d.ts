import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
export declare class EnrollmentController {
    private readonly enrollmentService;
    constructor(enrollmentService: EnrollmentService);
    create(createEnrollmentDto: CreateEnrollmentDto, user: CurrentUserPayload): Promise<import("./entities/enrollment.entity").Enrollment>;
    findAll(user: CurrentUserPayload, trainingId?: string, course?: string, shift?: string, active?: string): Promise<import("./entities/enrollment.entity").Enrollment[]>;
    findMine(user: CurrentUserPayload): Promise<import("./entities/enrollment.entity").Enrollment[]>;
    findOne(id: number): Promise<import("./entities/enrollment.entity").Enrollment>;
    update(id: number, updateEnrollmentDto: UpdateEnrollmentDto, user: CurrentUserPayload): Promise<import("./entities/enrollment.entity").Enrollment>;
    remove(id: number, user: CurrentUserPayload): Promise<import("typeorm").DeleteResult>;
}

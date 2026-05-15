import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
export declare class EnrollmentController {
    private readonly enrollmentService;
    constructor(enrollmentService: EnrollmentService);
    create(createEnrollmentDto: CreateEnrollmentDto): Promise<import("./entities/enrollment.entity").Enrollment>;
    findAll(): Promise<import("./entities/enrollment.entity").Enrollment[]>;
    findOne(id: number): Promise<import("./entities/enrollment.entity").Enrollment>;
    update(id: number, updateEnrollmentDto: UpdateEnrollmentDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}

import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
export declare class EnrollmentController {
    private readonly enrollmentService;
    constructor(enrollmentService: EnrollmentService);
    create(createEnrollmentDto: CreateEnrollmentDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateEnrollmentDto: UpdateEnrollmentDto): string;
    remove(id: string): string;
}

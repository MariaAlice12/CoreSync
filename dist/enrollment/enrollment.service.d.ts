import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
export declare class EnrollmentService {
    create(createEnrollmentDto: CreateEnrollmentDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateEnrollmentDto: UpdateEnrollmentDto): string;
    remove(id: number): string;
}

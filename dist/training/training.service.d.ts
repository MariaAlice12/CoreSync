import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { Training } from './entities/training.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { CurrentUserPayload } from 'src/auth/decorators/current-user.decorator';
export declare class TrainingService {
    private trainingRepo;
    private readonly userService;
    constructor(trainingRepo: Repository<Training>, userService: UserService);
    private resolveProfessor;
    create(dto: CreateTrainingDto, currentUser: CurrentUserPayload): Promise<Training>;
    findAll(): Promise<Training[]>;
    findOne(id: number): Promise<Training>;
    update(id: number, dto: UpdateTrainingDto, currentUser: CurrentUserPayload): Promise<Training>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}

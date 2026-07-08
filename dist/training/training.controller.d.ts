import { TrainingService } from './training.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
export declare class TrainingController {
    private readonly trainingService;
    constructor(trainingService: TrainingService);
    create(createTrainingDto: CreateTrainingDto, user: CurrentUserPayload): Promise<import("./entities/training.entity").Training>;
    findAll(): Promise<import("./entities/training.entity").Training[]>;
    findOne(id: number): Promise<import("./entities/training.entity").Training>;
    update(id: number, updateTrainingDto: UpdateTrainingDto, user: CurrentUserPayload): Promise<import("./entities/training.entity").Training>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}

import { TrainingService } from './training.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
export declare class TrainingController {
    private readonly trainingService;
    constructor(trainingService: TrainingService);
    create(createTrainingDto: CreateTrainingDto, user: CurrentUserPayload): Promise<import("./entities/training.entity").Training>;
    findAll(modality?: string, level?: string, professorId?: string, campus?: string, active?: string): Promise<import("./entities/training.entity").Training[]>;
    findOne(id: number): Promise<import("./entities/training.entity").Training>;
    update(id: number, updateTrainingDto: UpdateTrainingDto, user: CurrentUserPayload): Promise<import("./entities/training.entity").Training>;
    remove(id: number, user: CurrentUserPayload): Promise<import("typeorm").DeleteResult>;
}

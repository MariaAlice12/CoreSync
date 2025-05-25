import { TrainingService } from './training.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
export declare class TrainingController {
    private readonly trainingService;
    constructor(trainingService: TrainingService);
    create(createTrainingDto: CreateTrainingDto): Promise<import("./entities/training.entity").Training>;
    findAll(): Promise<import("./entities/training.entity").Training[]>;
    findOne(id: string): Promise<import("./entities/training.entity").Training>;
    update(id: string, updateTrainingDto: UpdateTrainingDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}

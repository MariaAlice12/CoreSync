import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { Training } from './entities/training.entity';
import { Repository } from 'typeorm';
export declare class TrainingService {
    private treinoRepo;
    constructor(treinoRepo: Repository<Training>);
    create(dto: CreateTrainingDto): Promise<Training>;
    findAll(): Promise<Training[]>;
    findOne(id: number): Promise<Training>;
    update(id: number, dto: UpdateTrainingDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}

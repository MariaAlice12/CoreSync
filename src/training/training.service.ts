import { Injectable } from '@nestjs/common';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { Training } from './entities/training.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TrainingService {
    constructor(
    @InjectRepository(Training)
    private treinoRepo: Repository<Training>,
  ) {}

 create(dto: CreateTrainingDto) {
    const treino = this.treinoRepo.create(dto);
    return this.treinoRepo.save(treino);
  }

  findAll() {
    return this.treinoRepo.find();
  }

  findOne(id: number) {
    return this.treinoRepo.findOneBy({ id });
  }

  update(id: number, dto: UpdateTrainingDto) {
    return this.treinoRepo.update(id, dto);
  }

  remove(id: number) {
    return this.treinoRepo.delete(id);
  }
}

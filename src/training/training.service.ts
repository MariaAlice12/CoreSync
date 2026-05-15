import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { Training } from './entities/training.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(Training)
    private trainingRepo: Repository<Training>,
  ) {}

  create(dto: CreateTrainingDto) {
    const training = this.trainingRepo.create(dto);
    return this.trainingRepo.save(training);
  }

  findAll() {
    return this.trainingRepo.find();
  }

  async findOne(id: number) {
    const training = await this.trainingRepo.findOneBy({ id });
    if (!training) throw new NotFoundException(`Treino #${id} não encontrado`);
    return training;
  }

  async update(id: number, dto: UpdateTrainingDto) {
    await this.findOne(id);
    return this.trainingRepo.update(id, dto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.trainingRepo.delete(id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Enrollment } from './entities/enrollment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { TrainingService } from 'src/training/training.service';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    private userService: UserService,
    private trainingService: TrainingService,
  ) {}

  async create(dto: CreateEnrollmentDto) {
    const user = await this.userService.findOne(dto.userId);
    const training = await this.trainingService.findOne(dto.trainingId);
    const enrollment = this.enrollmentRepo.create({ ...dto, user, training });
    return this.enrollmentRepo.save(enrollment);
  }

  findAll() {
    return this.enrollmentRepo.find();
  }

  async findOne(id: number) {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id } });
    if (!enrollment)
      throw new NotFoundException(`Matrícula #${id} não encontrada`);
    return enrollment;
  }

  async update(id: number, dto: UpdateEnrollmentDto) {
    await this.findOne(id);
    return this.enrollmentRepo.update(id, dto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.enrollmentRepo.delete(id);
  }

  async existsForUserAndTraining(
    userId: number,
    trainingId: number,
  ): Promise<boolean> {
    const count = await this.enrollmentRepo.count({
      where: { user: { id: userId }, training: { id: trainingId } },
    });
    return count > 0;
  }
}

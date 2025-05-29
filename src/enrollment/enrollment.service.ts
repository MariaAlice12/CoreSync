import { Inject, Injectable } from '@nestjs/common';
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


  ) { }

  async create(dto: CreateEnrollmentDto) {
    const user = await this.userService.findOne(dto.userId);
    const training = await this.trainingService.findOne(dto.trainingId);


    const enrollment = this.enrollmentRepo.create({...dto, user, training});
    return this.enrollmentRepo.save(enrollment);
  }

  findAll() {
    return this.enrollmentRepo.find();
  }

  findOne(id: number) {
    return this.enrollmentRepo.findOne({ where: { id } });
  }

  update(id: number, dto: UpdateEnrollmentDto) {
    return this.enrollmentRepo.update(id, dto);
  }

  remove(id: number) {
    return this.enrollmentRepo.delete(id);
  }
}

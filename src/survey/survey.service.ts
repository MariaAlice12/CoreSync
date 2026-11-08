import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveyResponse } from './entities/survey-response.entity';
import { CreateSurveyResponseDto } from './dto/create-survey-response.dto';
import { TrainingService } from 'src/training/training.service';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
import { CurrentUserPayload } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(SurveyResponse)
    private surveyRepo: Repository<SurveyResponse>,
    private readonly trainingService: TrainingService,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  async create(dto: CreateSurveyResponseDto, currentUser: CurrentUserPayload) {
    const training = await this.trainingService.findOne(dto.trainingId);

    const isEnrolled = await this.enrollmentService.existsForUserAndTraining(
      currentUser.id,
      dto.trainingId,
    );
    if (!isEnrolled) {
      throw new ForbiddenException(
        'Você precisa estar matriculado neste treino para avaliá-lo',
      );
    }

    const response = this.surveyRepo.create({
      training,
      user: { id: currentUser.id } as User,
      rating: dto.rating,
      comment: dto.comment,
    });
    return this.surveyRepo.save(response);
  }

  findAll() {
    return this.surveyRepo.find();
  }

  async findOne(id: number) {
    const response = await this.surveyRepo.findOne({ where: { id } });
    if (!response) {
      throw new NotFoundException(`Avaliação #${id} não encontrada`);
    }
    return response;
  }
}

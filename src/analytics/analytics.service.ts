import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Training } from 'src/training/entities/training.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { SurveyResponse } from 'src/survey/entities/survey-response.entity';
import { UserService } from 'src/user/user.service';
import { CurrentUserPayload } from 'src/auth/decorators/current-user.decorator';

export interface TrainingAnalyticsRow {
  trainingId: number;
  modality: string;
  professor: { id: number; name: string } | null;
  activeCount: number;
  inactiveCount: number;
  maxStudents: number;
  minStudents: number;
  occupancyPct: number;
  belowMinimum: boolean;
  avgRating: number | null;
  responseCount: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Training)
    private readonly trainingRepo: Repository<Training>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(SurveyResponse)
    private readonly surveyRepo: Repository<SurveyResponse>,
    private readonly userService: UserService,
  ) {}

  private async buildTrainingRow(training: Training): Promise<TrainingAnalyticsRow> {
    const [activeCount, inactiveCount, surveys] = await Promise.all([
      this.enrollmentRepo.count({
        where: { training: { id: training.id }, active: true },
      }),
      this.enrollmentRepo.count({
        where: { training: { id: training.id }, active: false },
      }),
      this.surveyRepo.find({ where: { training: { id: training.id } } }),
    ]);

    const occupancyPct =
      training.maxStudents > 0
        ? Math.round((activeCount / training.maxStudents) * 100)
        : 0;
    const responseCount = surveys.length;
    const avgRating =
      responseCount > 0
        ? surveys.reduce((sum, s) => sum + s.rating, 0) / responseCount
        : null;

    return {
      trainingId: training.id,
      modality: training.modality,
      professor: training.professor
        ? { id: training.professor.id, name: training.professor.name }
        : null,
      activeCount,
      inactiveCount,
      maxStudents: training.maxStudents,
      minStudents: training.minStudents,
      occupancyPct,
      belowMinimum: activeCount < training.minStudents,
      avgRating,
      responseCount,
    };
  }

  async adminOverview() {
    const trainings = await this.trainingRepo.find();
    const rows = await Promise.all(
      trainings.map((t) => this.buildTrainingRow(t)),
    );

    return {
      trainings: rows,
      totals: {
        totalTrainings: rows.length,
        totalActiveStudents: rows.reduce((sum, r) => sum + r.activeCount, 0),
        trainingsBelowMinimum: rows.filter((r) => r.belowMinimum).length,
      },
    };
  }

  async professorPerformance(
    currentUser: CurrentUserPayload,
    professorIdParam?: number,
  ) {
    let professorId: number;

    if (currentUser.userType === 'admin') {
      if (!professorIdParam) {
        throw new BadRequestException(
          'professorId é obrigatório quando quem consulta é um admin',
        );
      }
      await this.userService.findOne(professorIdParam);
      professorId = professorIdParam;
    } else if (currentUser.userType === 'professor') {
      // Ignora qualquer professorId vindo da query string: um professor só
      // pode ver os próprios números, nunca os de outro professor.
      professorId = currentUser.id;
    } else {
      throw new ForbiddenException(
        'Apenas professores e admins podem acessar essas métricas',
      );
    }

    const trainings = await this.trainingRepo.find({
      where: { professor: { id: professorId } },
    });
    const rows = await Promise.all(
      trainings.map((t) => this.buildTrainingRow(t)),
    );

    const totalResponses = rows.reduce((sum, r) => sum + r.responseCount, 0);
    const ratingSum = rows.reduce(
      (sum, r) => sum + (r.avgRating ?? 0) * r.responseCount,
      0,
    );

    return {
      professorId,
      trainings: rows,
      totals: {
        totalTrainings: rows.length,
        totalActiveStudents: rows.reduce((sum, r) => sum + r.activeCount, 0),
        trainingsBelowMinimum: rows.filter((r) => r.belowMinimum).length,
        overallAvgRating: totalResponses > 0 ? ratingSum / totalResponses : null,
      },
    };
  }
}

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Enrollment } from './entities/enrollment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { TrainingService } from 'src/training/training.service';
import { Training } from 'src/training/entities/training.entity';
import { CurrentUserPayload } from 'src/auth/decorators/current-user.decorator';

export interface EnrollmentFilters {
  trainingId?: number;
  course?: string;
  shift?: string;
  active?: boolean;
}

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    private userService: UserService,
    private trainingService: TrainingService,
  ) {}

  private async assertHasVacancy(training: Training) {
    const active = await this.enrollmentRepo.count({
      where: { training: { id: training.id }, active: true },
    });
    if (active >= training.maxStudents) {
      throw new ConflictException(
        `Treino de ${training.modality} está lotado (${training.maxStudents} vagas)`,
      );
    }
  }

  private assertCanManage(
    enrollment: Enrollment,
    currentUser: CurrentUserPayload,
  ) {
    if (currentUser.userType === 'admin') return;
    if (enrollment.user.id === currentUser.id) return;
    if (
      currentUser.userType === 'professor' &&
      enrollment.training.professor?.id === currentUser.id
    ) {
      return;
    }
    throw new ForbiddenException('Você não pode alterar esta matrícula');
  }

  async create(dto: CreateEnrollmentDto, currentUser: CurrentUserPayload) {
    const userId =
      currentUser.userType === 'aluno' || !dto.userId
        ? currentUser.id
        : dto.userId;
    const user = await this.userService.findOne(userId);
    const training = await this.trainingService.findOne(dto.trainingId);

    if (!training.active) {
      throw new BadRequestException('Este treino está desativado');
    }

    const existing = await this.enrollmentRepo.findOne({
      where: { user: { id: userId }, training: { id: training.id } },
    });
    if (existing?.active) {
      throw new ConflictException('Usuário já está matriculado neste treino');
    }

    await this.assertHasVacancy(training);

    // Matrícula cancelada é reativada em vez de duplicada.
    if (existing) {
      existing.active = true;
      if (dto.selfLevel) existing.selfLevel = dto.selfLevel;
      return this.enrollmentRepo.save(existing);
    }
    const enrollment = this.enrollmentRepo.create({
      user,
      training,
      active: dto.active ?? true,
      selfLevel: dto.selfLevel ?? null,
    });
    return this.enrollmentRepo.save(enrollment);
  }

  findAll(currentUser: CurrentUserPayload, filters: EnrollmentFilters = {}) {
    const where: FindOptionsWhere<Enrollment> = {};
    const userWhere: FindOptionsWhere<Enrollment['user']> = {};

    // Aluno só enxerga as próprias matrículas.
    if (currentUser.userType === 'aluno') userWhere.id = currentUser.id;
    if (filters.course) userWhere.course = filters.course;
    if (filters.shift) userWhere.shift = filters.shift as never;
    if (Object.keys(userWhere).length) where.user = userWhere;

    if (filters.trainingId) where.training = { id: filters.trainingId };
    if (filters.active !== undefined) where.active = filters.active;

    return this.enrollmentRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  findForUser(userId: number) {
    return this.enrollmentRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id } });
    if (!enrollment)
      throw new NotFoundException(`Matrícula #${id} não encontrada`);
    return enrollment;
  }

  async update(
    id: number,
    dto: UpdateEnrollmentDto,
    currentUser: CurrentUserPayload,
  ) {
    const enrollment = await this.findOne(id);
    this.assertCanManage(enrollment, currentUser);

    if (dto.active && !enrollment.active) {
      await this.assertHasVacancy(enrollment.training);
    }
    if (dto.active !== undefined) enrollment.active = dto.active;
    if (dto.selfLevel !== undefined) enrollment.selfLevel = dto.selfLevel;
    return this.enrollmentRepo.save(enrollment);
  }

  async remove(id: number, currentUser: CurrentUserPayload) {
    const enrollment = await this.findOne(id);
    this.assertCanManage(enrollment, currentUser);
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

  async isActivelyEnrolled(userId: number, trainingId: number) {
    const count = await this.enrollmentRepo.count({
      where: {
        user: { id: userId },
        training: { id: trainingId },
        active: true,
      },
    });
    return count > 0;
  }
}

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { Training } from './entities/training.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { CurrentUserPayload } from 'src/auth/decorators/current-user.decorator';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { NotificationService } from 'src/notification/notification.service';
import {
  describeConflicts,
  findTrainingConflicts,
  normalizeKey,
  TrainingSlot,
} from './training-conflicts';

export interface TrainingFilters {
  modality?: string;
  level?: string;
  professorId?: number;
  campus?: string;
  active?: boolean;
}

// Campos cuja alteração afeta a agenda do atleta e por isso gera notificação.
const SCHEDULE_FIELDS = [
  'hour',
  'durationMinutes',
  'address',
  'weekdays',
  'active',
] as const;

// Campos que, alterados, exigem checar de novo os conflitos de agenda.
const CONFLICT_FIELDS = [
  'modality',
  'level',
  'campus',
  'address',
  'weekdays',
  'hour',
  'durationMinutes',
  'active',
] as const;

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(Training)
    private trainingRepo: Repository<Training>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  private async resolveProfessor(professorId: number) {
    const professor = await this.userService.findOne(professorId);
    if (professor.userType !== 'professor') {
      throw new BadRequestException(
        `Usuário #${professorId} não é um professor`,
      );
    }
    return professor;
  }

  /** Modalidades já cadastradas (uma grafia por modalidade), em ordem alfabética. */
  async modalities(): Promise<string[]> {
    const rows = await this.trainingRepo
      .createQueryBuilder('t')
      .select('t.modality', 'modality')
      .addSelect('COUNT(*)', 'total')
      .groupBy('t.modality')
      .getRawMany<{ modality: string; total: string }>();
    const byKey = new Map<string, { modality: string; total: number }>();
    for (const r of rows) {
      const key = normalizeKey(r.modality);
      const current = byKey.get(key);
      if (!current || Number(r.total) > current.total) {
        byKey.set(key, { modality: r.modality, total: Number(r.total) });
      }
    }
    return [...byKey.values()]
      .map((v) => v.modality)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  /** Adota a grafia já cadastrada ("judo" → "Judô") para não duplicar modalidades. */
  private async canonicalModality(modality: string) {
    const key = normalizeKey(modality);
    const existing = (await this.modalities()).find(
      (m) => normalizeKey(m) === key,
    );
    return existing ?? modality.trim().replace(/\s+/g, ' ');
  }

  /** 409 se o treino repetir uma turma ou chocar local/professor com outro treino ativo. */
  private async assertNoConflicts(candidate: TrainingSlot) {
    if (candidate.active === false) return;
    const others = await this.trainingRepo.find({ where: { active: true } });
    const conflicts = findTrainingConflicts(candidate, others);
    if (conflicts.length > 0) {
      throw new ConflictException(describeConflicts(conflicts));
    }
  }

  private assertCanManage(training: Training, currentUser: CurrentUserPayload) {
    if (currentUser.userType === 'admin') return;
    if (
      currentUser.userType === 'professor' &&
      training.professor?.id === currentUser.id
    ) {
      return;
    }
    throw new ForbiddenException(
      'Você só pode alterar treinos dos quais é o professor responsável',
    );
  }

  async create(dto: CreateTrainingDto, currentUser: CurrentUserPayload) {
    const { professorId, ...rest } = dto;

    if (currentUser.userType === 'aluno') {
      throw new ForbiddenException('Alunos não podem criar treinos');
    }

    let professor;
    if (currentUser.userType === 'professor') {
      professor = await this.userService.findOne(currentUser.id);
    } else {
      // admin
      if (!professorId) {
        throw new BadRequestException(
          'professorId é obrigatório quando o treino é criado por um admin',
        );
      }
      professor = await this.resolveProfessor(professorId);
    }

    rest.modality = await this.canonicalModality(rest.modality);
    await this.assertNoConflicts({
      ...rest,
      professor,
      active: rest.active ?? true,
    });

    const training = await this.trainingRepo.save(
      this.trainingRepo.create({ ...rest, professor }),
    );

    if (training.active) {
      const athletes = await this.userService.findIdsByType('aluno');
      await this.notificationService.notifyUsers(athletes, {
        type: 'training_created',
        title: `Novo treino de ${training.modality}`,
        message: `${training.weekdays.join(', ')} às ${training.hour} — ${training.address}`,
        link: '/dashboard/atleta',
      });
    }

    return training;
  }

  findAll(filters: TrainingFilters = {}) {
    const where: FindOptionsWhere<Training> = {};
    if (filters.modality) where.modality = filters.modality;
    if (filters.level) where.level = filters.level as Training['level'];
    if (filters.campus) where.campus = filters.campus;
    if (filters.active !== undefined) where.active = filters.active;
    if (filters.professorId) where.professor = { id: filters.professorId };
    return this.trainingRepo.find({ where, order: { modality: 'ASC' } });
  }

  async findOne(id: number) {
    const training = await this.trainingRepo.findOneBy({ id });
    if (!training) throw new NotFoundException(`Treino #${id} não encontrado`);
    return training;
  }

  async update(
    id: number,
    dto: UpdateTrainingDto,
    currentUser: CurrentUserPayload,
  ) {
    const training = await this.findOne(id);
    this.assertCanManage(training, currentUser);
    const { professorId, ...rest } = dto;

    if (professorId !== undefined) {
      if (currentUser.userType !== 'admin') {
        throw new ForbiddenException(
          'Somente admins podem reatribuir o professor de um treino',
        );
      }
      training.professor = await this.resolveProfessor(professorId);
    }

    if (rest.modality !== undefined) {
      rest.modality = await this.canonicalModality(rest.modality);
    }
    const needsCheck =
      professorId !== undefined ||
      CONFLICT_FIELDS.some(
        (f) =>
          rest[f] !== undefined &&
          JSON.stringify(rest[f]) !== JSON.stringify(training[f]),
      );
    if (needsCheck) {
      await this.assertNoConflicts({ ...training, ...rest });
    }

    const scheduleChanged = SCHEDULE_FIELDS.some(
      (f) =>
        rest[f] !== undefined &&
        JSON.stringify(rest[f]) !== JSON.stringify(training[f]),
    );

    Object.assign(training, rest);
    const saved = await this.trainingRepo.save(training);

    if (scheduleChanged) {
      await this.notificationService.notifyUsers(
        await this.activeStudentIds(id),
        {
          type: 'training_updated',
          title: `Treino de ${saved.modality} foi alterado`,
          message: saved.active
            ? `Agora: ${saved.weekdays.join(', ')} às ${saved.hour} — ${saved.address}`
            : 'O treino foi desativado.',
          link: '/agenda',
          critical: true,
        },
      );
    }

    return saved;
  }

  async remove(id: number, currentUser: CurrentUserPayload) {
    const training = await this.findOne(id);
    this.assertCanManage(training, currentUser);
    return this.trainingRepo.delete(id);
  }

  async activeStudentIds(trainingId: number): Promise<number[]> {
    const enrollments = await this.enrollmentRepo.find({
      where: { training: { id: trainingId }, active: true },
    });
    return enrollments.map((e) => e.user.id);
  }
}

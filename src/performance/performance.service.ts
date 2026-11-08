import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { toISODate } from 'src/attendance/weekdays';
import { Training } from 'src/training/entities/training.entity';
import { User } from 'src/user/entities/user.entity';
import { CurrentUserPayload } from 'src/auth/decorators/current-user.decorator';
import { NotificationService } from 'src/notification/notification.service';
import { PerformanceRecord } from './entities/performance-record.entity';
import { UpsertPerformanceDto } from './dto/upsert-performance.dto';

/** Versão enxuta do registro, usada nas listas de presença e no painel do atleta. */
export interface PerformanceSummary {
  id: number;
  rating: number | null;
  notes: string | null;
  metrics: PerformanceRecord['metrics'];
  updatedAt: Date;
}

export function toPerformanceSummary(r: PerformanceRecord): PerformanceSummary {
  return {
    id: r.id,
    rating: r.rating,
    notes: r.notes,
    metrics: r.metrics ?? [],
    updatedAt: r.updatedAt,
  };
}

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(PerformanceRecord)
    private readonly recordRepo: Repository<PerformanceRecord>,
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    private readonly notificationService: NotificationService,
  ) {}

  private assertStaff(training: Training, currentUser: CurrentUserPayload) {
    const allowed =
      currentUser.userType === 'admin' ||
      training.professor?.id === currentUser.id;
    if (!allowed) {
      throw new ForbiddenException(
        'Somente o professor do treino ou um admin registra desempenho',
      );
    }
  }

  async upsert(
    attendanceId: number,
    dto: UpsertPerformanceDto,
    currentUser: CurrentUserPayload,
  ) {
    const attendance = await this.attendanceRepo.findOne({
      where: { id: attendanceId },
      relations: { training: true },
    });
    if (!attendance) {
      throw new NotFoundException(`Presença #${attendanceId} não encontrada`);
    }
    this.assertStaff(attendance.training, currentUser);
    if (attendance.date > toISODate(new Date())) {
      throw new BadRequestException(
        'Só é possível registrar desempenho de sessões que já aconteceram',
      );
    }
    if (
      dto.rating === undefined &&
      !dto.notes?.trim() &&
      !dto.metrics?.length
    ) {
      throw new BadRequestException(
        'Informe ao menos uma nota, observação ou métrica',
      );
    }

    const existing = await this.recordRepo.findOne({
      where: { attendance: { id: attendanceId } },
    });
    const record = await this.recordRepo.save({
      ...(existing ?? {}),
      attendance: { id: attendanceId } as Attendance,
      rating: dto.rating ?? null,
      notes: dto.notes?.trim() || null,
      metrics: dto.metrics ?? [],
      recordedBy: { id: currentUser.id } as User,
    });

    await this.notificationService.notifyUsers([attendance.user.id], {
      type: 'performance_recorded',
      title: `Desempenho registrado: ${attendance.training.modality}`,
      message: `Seu professor ${existing ? 'atualizou' : 'registrou'} o desempenho do treino de ${attendance.date.split('-').reverse().join('/')}.`,
      link: '/dashboard/atleta?tab=desempenho',
    });

    return toPerformanceSummary(record as PerformanceRecord);
  }

  async remove(id: number, currentUser: CurrentUserPayload) {
    const record = await this.recordRepo.findOne({
      where: { id },
      relations: { attendance: { training: true } },
    });
    if (!record) {
      throw new NotFoundException(`Registro #${id} não encontrado`);
    }
    this.assertStaff(record.attendance.training, currentUser);
    await this.recordRepo.delete(id);
    return { deleted: true };
  }

  async findForUser(userId: number) {
    const records = await this.recordRepo.find({
      where: { attendance: { user: { id: userId } } },
      relations: { attendance: { training: true } },
    });
    return records
      .map((r) => ({
        ...toPerformanceSummary(r),
        date: r.attendance.date,
        training: {
          id: r.attendance.training.id,
          modality: r.attendance.training.modality,
        },
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async findForTraining(
    trainingId: number,
    currentUser: CurrentUserPayload,
    from?: string,
  ) {
    const attendance = await this.attendanceRepo.findOne({
      where: { training: { id: trainingId } },
      relations: { training: true },
    });
    if (attendance) this.assertStaff(attendance.training, currentUser);
    else if (currentUser.userType === 'aluno') {
      throw new ForbiddenException();
    }

    const records = await this.recordRepo.find({
      where: {
        attendance: {
          training: { id: trainingId },
          ...(from ? { date: MoreThanOrEqual(from) } : {}),
        },
      },
      relations: { attendance: true },
    });
    return records
      .map((r) => ({
        ...toPerformanceSummary(r),
        date: r.attendance.date,
        athlete: { id: r.attendance.user.id, name: r.attendance.user.name },
        attendanceId: r.attendance.id,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }
}

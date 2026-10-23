import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { TrainingService } from 'src/training/training.service';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
import { Training } from 'src/training/entities/training.entity';
import { User } from 'src/user/entities/user.entity';
import { CurrentUserPayload } from 'src/auth/decorators/current-user.decorator';
import { toISODate, trainingHappensOn } from './weekdays';

export interface AttendanceSession {
  date: string;
  count: number;
  attendees: { id: number; name: string; attendanceId: number }[];
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    private readonly trainingService: TrainingService,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  async create(dto: CreateAttendanceDto, currentUser: CurrentUserPayload) {
    const training = await this.trainingService.findOne(dto.trainingId);
    const date = dto.date ?? toISODate(new Date());

    if (!training.active) {
      throw new BadRequestException('Este treino está desativado');
    }
    if (date < toISODate(new Date())) {
      throw new BadRequestException(
        'Não é possível confirmar presença em uma data passada',
      );
    }
    if (!trainingHappensOn(training.weekdays, date)) {
      throw new BadRequestException(
        `O treino de ${training.modality} não acontece neste dia (${training.weekdays.join(', ')})`,
      );
    }
    if (
      !(await this.enrollmentService.isActivelyEnrolled(
        currentUser.id,
        training.id,
      ))
    ) {
      throw new ForbiddenException(
        'Você precisa estar matriculado neste treino para confirmar presença',
      );
    }

    const duplicate = await this.attendanceRepo.count({
      where: {
        user: { id: currentUser.id },
        training: { id: training.id },
        date,
      },
    });
    if (duplicate > 0) {
      throw new ConflictException('Presença já confirmada para este dia');
    }

    return this.attendanceRepo.save(
      this.attendanceRepo.create({
        user: { id: currentUser.id } as User,
        training: { id: training.id } as Training,
        date,
      }),
    );
  }

  async remove(id: number, currentUser: CurrentUserPayload) {
    const attendance = await this.attendanceRepo.findOne({
      where: { id },
      relations: { training: true },
    });
    if (!attendance)
      throw new NotFoundException(`Presença #${id} não encontrada`);

    const isOwner = attendance.user.id === currentUser.id;
    const isStaff =
      currentUser.userType === 'admin' ||
      attendance.training.professor?.id === currentUser.id;
    if (!isOwner && !isStaff) {
      throw new ForbiddenException('Você não pode cancelar esta presença');
    }
    if (isOwner && !isStaff && attendance.date < toISODate(new Date())) {
      throw new BadRequestException(
        'Não é possível cancelar presença de uma data passada',
      );
    }
    return this.attendanceRepo.delete(id);
  }

  findForUser(userId: number) {
    return this.attendanceRepo.find({
      where: { user: { id: userId } },
      relations: { training: true },
      order: { date: 'DESC' },
    });
  }

  /**
   * Sessões de um treino com a lista de confirmados. Visível ao professor
   * responsável, a admins e aos atletas matriculados no treino.
   */
  async sessionsForTraining(
    trainingId: number,
    currentUser: CurrentUserPayload,
    opts: { date?: string; from?: string } = {},
  ): Promise<AttendanceSession[]> {
    const training = await this.trainingService.findOne(trainingId);
    const allowed =
      currentUser.userType === 'admin' ||
      training.professor?.id === currentUser.id ||
      (await this.enrollmentService.isActivelyEnrolled(
        currentUser.id,
        trainingId,
      ));
    if (!allowed) {
      throw new ForbiddenException(
        'Você não tem acesso às presenças deste treino',
      );
    }

    const attendances = await this.attendanceRepo.find({
      where: {
        training: { id: trainingId },
        ...(opts.date
          ? { date: opts.date }
          : opts.from
            ? { date: MoreThanOrEqual(opts.from) }
            : {}),
      },
      order: { date: 'ASC' },
    });

    const sessions = new Map<string, AttendanceSession>();
    for (const a of attendances) {
      const session = sessions.get(a.date) ?? {
        date: a.date,
        count: 0,
        attendees: [],
      };
      session.count++;
      session.attendees.push({
        id: a.user.id,
        name: a.user.name,
        attendanceId: a.id,
      });
      sessions.set(a.date, session);
    }
    return [...sessions.values()];
  }
}

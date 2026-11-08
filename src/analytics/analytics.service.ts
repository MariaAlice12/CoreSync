import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, MoreThanOrEqual, Repository } from 'typeorm';
import { Training } from 'src/training/entities/training.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { SurveyResponse } from 'src/survey/entities/survey-response.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { Strava } from 'src/strava/entities/strava.entity';
import { StravaService } from 'src/strava/strava.service';
import { UserService } from 'src/user/user.service';
import { PerformanceRecord } from 'src/performance/entities/performance-record.entity';
import { toPerformanceSummary } from 'src/performance/performance.service';
import {
  matchActivityToSession,
  toSessionActivity,
} from 'src/attendance/session-activity';
import {
  parseISODate,
  toISODate,
  trainingHappensOn,
} from 'src/attendance/weekdays';
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

export interface SegmentRow {
  key: string;
  enrollments: number;
  attendances: number;
}

export interface SegmentationFilters {
  modality?: string;
  level?: string;
  course?: string;
  shift?: string;
  campus?: string;
}

const NOT_INFORMED = 'Não informado';

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
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
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    @InjectRepository(Strava)
    private readonly activityRepo: Repository<Strava>,
    @InjectRepository(PerformanceRecord)
    private readonly performanceRepo: Repository<PerformanceRecord>,
    private readonly userService: UserService,
  ) {}

  private async buildTrainingRow(
    training: Training,
  ): Promise<TrainingAnalyticsRow> {
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
    // Treinos desativados ficam de fora: com 0 alunos, sempre apareceriam
    // como "abaixo do mínimo" e distorceriam os totais.
    const trainings = await this.trainingRepo.find({ where: { active: true } });
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
      where: { professor: { id: professorId }, active: true },
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
        overallAvgRating:
          totalResponses > 0 ? ratingSum / totalResponses : null,
      },
    };
  }

  /**
   * BI segmentado: matrículas ativas e presenças (últimos 30 dias) agrupadas
   * por modalidade, nível, curso, turno e campus. Os filtros recortam a base
   * antes do agrupamento, permitindo cruzar critérios (ex.: turno noite em vôlei).
   */
  async segmentation(filters: SegmentationFilters = {}) {
    const [enrollments, attendances, athletes] = await Promise.all([
      this.enrollmentRepo.find({
        where: { active: true, training: { active: true } },
      }),
      this.attendanceRepo.find({
        where: { date: MoreThanOrEqual(toISODate(daysAgo(30))) },
        relations: { training: true },
      }),
      this.userService.findAll({ userType: 'aluno' }),
    ]);

    const matches = (training: Training, user: Enrollment['user']) =>
      (!filters.modality || training.modality === filters.modality) &&
      (!filters.level || training.level === filters.level) &&
      (!filters.course || user.course === filters.course) &&
      (!filters.shift || user.shift === filters.shift) &&
      (!filters.campus || (user.campus ?? training.campus) === filters.campus);

    const filteredEnrollments = enrollments.filter((e) =>
      matches(e.training, e.user),
    );
    const filteredAttendances = attendances.filter((a) =>
      matches(a.training, a.user),
    );

    type Dimension = (
      t: Training,
      u: Enrollment['user'],
    ) => string | null | undefined;
    const dimensions: Record<string, Dimension> = {
      byModality: (t) => t.modality,
      byLevel: (t) => t.level,
      byCourse: (_t, u) => u.course,
      byShift: (_t, u) => u.shift,
      byCampus: (t, u) => u.campus ?? t.campus,
    };

    const result: Record<string, SegmentRow[]> = {};
    for (const [name, pick] of Object.entries(dimensions)) {
      const rows = new Map<string, SegmentRow>();
      const row = (key: string | null | undefined) => {
        const k = key || NOT_INFORMED;
        if (!rows.has(k))
          rows.set(k, { key: k, enrollments: 0, attendances: 0 });
        return rows.get(k)!;
      };
      filteredEnrollments.forEach(
        (e) => row(pick(e.training, e.user)).enrollments++,
      );
      filteredAttendances.forEach(
        (a) => row(pick(a.training, a.user)).attendances++,
      );
      result[name] = [...rows.values()].sort(
        (a, b) => b.enrollments - a.enrollments,
      );
    }

    const enrolledAthletes = new Set(filteredEnrollments.map((e) => e.user.id));

    return {
      filters,
      totals: {
        athletes: athletes.length,
        enrolledAthletes: enrolledAthletes.size,
        activeEnrollments: filteredEnrollments.length,
        attendancesLast30Days: filteredAttendances.length,
      },
      ...result,
    };
  }

  /**
   * Taxa de presença por sessão nas últimas `weeks` semanas, incluindo
   * sessões sem nenhuma confirmação.
   */
  async attendanceRate(
    trainingId: number,
    currentUser: CurrentUserPayload,
    weeks = 8,
  ) {
    const training = await this.trainingRepo.findOneBy({ id: trainingId });
    if (!training)
      throw new BadRequestException(`Treino #${trainingId} não encontrado`);
    if (
      currentUser.userType !== 'admin' &&
      training.professor?.id !== currentUser.id
    ) {
      throw new ForbiddenException('Apenas o professor do treino ou um admin');
    }

    const from = toISODate(daysAgo(weeks * 7));
    const today = toISODate(new Date());
    const [attendances, enrolled] = await Promise.all([
      this.attendanceRepo.find({
        where: { training: { id: trainingId }, date: Between(from, today) },
      }),
      this.enrollmentRepo.count({
        where: { training: { id: trainingId }, active: true },
      }),
    ]);

    const counts = new Map<string, number>();
    attendances.forEach((a) =>
      counts.set(a.date, (counts.get(a.date) ?? 0) + 1),
    );

    const sessions: { date: string; present: number; ratePct: number }[] = [];
    for (
      let d = parseISODate(from);
      toISODate(d) <= today;
      d.setDate(d.getDate() + 1)
    ) {
      const date = toISODate(d);
      if (!trainingHappensOn(training.weekdays, date)) continue;
      const present = counts.get(date) ?? 0;
      sessions.push({
        date,
        present,
        ratePct: enrolled > 0 ? Math.round((present / enrolled) * 100) : 0,
      });
    }

    const avg =
      sessions.length > 0
        ? Math.round(
            sessions.reduce((s, x) => s + x.ratePct, 0) / sessions.length,
          )
        : 0;

    return {
      trainingId,
      modality: training.modality,
      activeEnrollments: enrolled,
      averageRatePct: avg,
      sessions,
    };
  }

  /** Evolução de um atleta: presenças por semana e métricas do Strava. */
  async athletePerformance(athleteId: number, currentUser: CurrentUserPayload) {
    if (currentUser.userType === 'aluno' && currentUser.id !== athleteId) {
      throw new ForbiddenException('Você só pode ver o próprio desempenho');
    }
    const athlete = await this.userService.findOne(athleteId);

    const [attendances, activities] = await Promise.all([
      this.attendanceRepo.find({
        where: { user: { id: athleteId } },
        relations: { training: true },
        order: { date: 'ASC' },
      }),
      this.activityRepo.find({
        where: { user: { id: athleteId } },
        order: { startDate: 'ASC' },
      }),
    ]);

    const records = attendances.length
      ? await this.performanceRepo.find({
          where: { attendance: { id: In(attendances.map((a) => a.id)) } },
          relations: { attendance: true },
        })
      : [];
    const recordByAttendance = new Map(
      records.map((r) => [r.attendance.id, r]),
    );

    const weekOf = (date: string) => {
      const d = parseISODate(date);
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      return toISODate(d);
    };

    // Agrupa presenças (e notas do professor) pela segunda-feira da semana.
    const byWeek = new Map<string, number>();
    const ratings = new Map<string, number[]>();
    for (const a of attendances) {
      const week = weekOf(a.date);
      byWeek.set(week, (byWeek.get(week) ?? 0) + 1);
      const rating = recordByAttendance.get(a.id)?.rating;
      if (rating) ratings.set(week, [...(ratings.get(week) ?? []), rating]);
    }

    // Cada sessão com a atividade do Strava do dia e o desempenho registrado.
    const sessions = attendances
      .map((a) => {
        const match = matchActivityToSession(
          activities,
          a.date,
          a.training.hour,
        );
        const record = recordByAttendance.get(a.id);
        return {
          attendanceId: a.id,
          date: a.date,
          training: { id: a.training.id, modality: a.training.modality },
          activity: match ? toSessionActivity(match) : null,
          performance: record ? toPerformanceSummary(record) : null,
        };
      })
      .reverse();

    const byModality = new Map<string, number>();
    attendances.forEach((a) =>
      byModality.set(
        a.training.modality,
        (byModality.get(a.training.modality) ?? 0) + 1,
      ),
    );

    const totalDistance = activities.reduce((s, a) => s + a.distance, 0);
    const totalTime = activities.reduce((s, a) => s + a.movingTime, 0);
    const hr = activities.filter((a) => a.averageHeartrate);

    return {
      athlete: {
        id: athlete.id,
        name: athlete.name,
        course: athlete.course,
        shift: athlete.shift,
      },
      totals: {
        attendances: attendances.length,
        activities: activities.length,
        distanceKm: Math.round(totalDistance / 100) / 10,
        movingTimeMin: Math.round(totalTime / 60),
        avgPace: totalDistance > 0 ? totalTime / (totalDistance / 1000) : null,
        avgHeartrate:
          hr.length > 0
            ? Math.round(
                hr.reduce((s, a) => s + (a.averageHeartrate ?? 0), 0) /
                  hr.length,
              )
            : null,
      },
      attendanceByWeek: [...byWeek.entries()].map(([week, count]) => ({
        week,
        count,
      })),
      attendanceByModality: [...byModality.entries()].map(
        ([modality, count]) => ({
          modality,
          count,
        }),
      ),
      ratingByWeek: [...ratings.entries()].map(([week, list]) => ({
        week,
        average:
          Math.round((list.reduce((t, r) => t + r, 0) / list.length) * 10) / 10,
        count: list.length,
      })),
      sessions,
      activities: activities.map(StravaService.toDto),
    };
  }
}

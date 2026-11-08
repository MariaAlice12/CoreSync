import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { toISODate } from './weekdays';

const WEEKDAYS = [
  'domingo',
  'segunda',
  'terca',
  'quarta',
  'quinta',
  'sexta',
  'sabado',
];

describe('AttendanceService', () => {
  const today = new Date();
  const todayISO = toISODate(today);
  const training = {
    id: 1,
    modality: 'Vôlei',
    active: true,
    weekdays: [WEEKDAYS[today.getDay()]],
    professor: { id: 9 },
  };
  const athlete = { id: 5, email: 'a@x.com', userType: 'aluno' };

  let repo: { count: jest.Mock; save: jest.Mock; create: jest.Mock };
  let enrollment: { isActivelyEnrolled: jest.Mock };
  let service: AttendanceService;

  beforeEach(() => {
    repo = {
      count: jest.fn().mockResolvedValue(0),
      save: jest.fn((x) => Promise.resolve({ id: 1, ...x })),
      create: jest.fn((x) => x),
    };
    enrollment = { isActivelyEnrolled: jest.fn().mockResolvedValue(true) };
    service = new AttendanceService(
      repo as never,
      {} as never,
      {} as never,
      { findOne: jest.fn().mockResolvedValue(training) } as never,
      enrollment as never,
    );
  });

  it('confirma presença para hoje quando a data é omitida', async () => {
    const res = await service.create({ trainingId: 1 }, athlete);
    expect(res.date).toBe(todayISO);
    expect(repo.save).toHaveBeenCalled();
  });

  it('recusa presença duplicada', async () => {
    repo.count.mockResolvedValue(1);
    await expect(
      service.create({ trainingId: 1 }, athlete),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('recusa atleta não matriculado', async () => {
    enrollment.isActivelyEnrolled.mockResolvedValue(false);
    await expect(
      service.create({ trainingId: 1 }, athlete),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('recusa data passada', async () => {
    await expect(
      service.create({ trainingId: 1, date: '2000-01-03' }, athlete),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('recusa dia em que o treino não acontece', async () => {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    await expect(
      service.create({ trainingId: 1, date: toISODate(tomorrow) }, athlete),
    ).rejects.toThrow(/não acontece neste dia/);
  });
});

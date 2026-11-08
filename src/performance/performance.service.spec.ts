import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { toISODate } from 'src/attendance/weekdays';

describe('PerformanceService', () => {
  const todayISO = toISODate(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const professor = { id: 9, email: 'p@x.com', userType: 'professor' };
  const attendance = (date = todayISO) => ({
    id: 3,
    date,
    user: { id: 5, name: 'Ana' },
    training: { id: 1, modality: 'Vôlei', professor: { id: 9 } },
  });

  let records: { findOne: jest.Mock; save: jest.Mock };
  let attendances: { findOne: jest.Mock };
  let notifications: { notifyUsers: jest.Mock };
  let service: PerformanceService;

  beforeEach(() => {
    records = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn((x) =>
        Promise.resolve({ id: 7, updatedAt: new Date(), ...x }),
      ),
    };
    attendances = { findOne: jest.fn().mockResolvedValue(attendance()) };
    notifications = { notifyUsers: jest.fn() };
    service = new PerformanceService(
      records as never,
      attendances as never,
      notifications as never,
    );
  });

  it('professor do treino registra e o atleta é notificado', async () => {
    const res = await service.upsert(
      3,
      { rating: 4, metrics: [{ name: 'Saques certos', value: 12 }] },
      professor,
    );
    expect(res).toMatchObject({ id: 7, rating: 4, notes: null });
    expect(notifications.notifyUsers).toHaveBeenCalledWith(
      [5],
      expect.objectContaining({ type: 'performance_recorded' }),
    );
  });

  it('atualiza o registro existente em vez de criar outro', async () => {
    records.findOne.mockResolvedValue({ id: 7, rating: 2 });
    await service.upsert(3, { rating: 5 }, professor);
    expect(records.save.mock.calls[0][0]).toMatchObject({ id: 7, rating: 5 });
  });

  it('outro professor não registra', async () => {
    await expect(
      service.upsert(3, { rating: 3 }, { ...professor, id: 2 }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('admin registra mesmo sem ser o professor', async () => {
    await expect(
      service.upsert(
        3,
        { notes: 'ok' },
        { id: 1, email: '', userType: 'admin' },
      ),
    ).resolves.toMatchObject({ notes: 'ok' });
  });

  it('recusa sessão futura', async () => {
    attendances.findOne.mockResolvedValue(attendance(toISODate(tomorrow)));
    await expect(
      service.upsert(3, { rating: 3 }, professor),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('recusa registro vazio', async () => {
    await expect(
      service.upsert(3, { notes: '   ', metrics: [] }, professor),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(records.save).not.toHaveBeenCalled();
  });
});

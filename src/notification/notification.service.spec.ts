import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  it('persiste uma notificação por usuário (sem repetir) e emite via WebSocket', async () => {
    const repo = {
      create: jest.fn((x) => x),
      save: jest.fn((list) =>
        Promise.resolve(
          list.map((n: object, i: number) => ({ id: i + 1, ...n })),
        ),
      ),
    };
    const gateway = { emitToUser: jest.fn() };
    const service = new NotificationService(repo as never, gateway as never);

    await service.notifyUsers([3, 4, 3], {
      type: 'training_updated',
      title: 'Treino alterado',
      message: 'Novo horário',
    });

    expect(repo.save.mock.calls[0][0]).toHaveLength(2);
    expect(gateway.emitToUser.mock.calls.map((c) => c[0])).toEqual([3, 4]);
    expect(gateway.emitToUser.mock.calls[0][2]).not.toHaveProperty('user');
  });

  it('não faz nada sem destinatários', async () => {
    const repo = { save: jest.fn() };
    const service = new NotificationService(repo as never, {} as never);
    await expect(
      service.notifyUsers([], {
        type: 'event_created',
        title: '',
        message: '',
      }),
    ).resolves.toEqual([]);
    expect(repo.save).not.toHaveBeenCalled();
  });
});

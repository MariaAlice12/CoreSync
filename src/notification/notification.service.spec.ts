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

  describe('fallback por e-mail', () => {
    const setup = () => {
      const repo = {
        create: jest.fn((x) => x),
        save: jest.fn((list) =>
          Promise.resolve(
            list.map((n: object, i: number) => ({ id: i + 1, ...n })),
          ),
        ),
      };
      const mail = { enabled: true, sendMany: jest.fn().mockResolvedValue(1) };
      const users = {
        find: jest
          .fn()
          .mockResolvedValue([{ id: 3, name: 'Ana', email: 'ana@x.com' }]),
      };
      const service = new NotificationService(
        repo as never,
        { emitToUser: jest.fn() } as never,
        mail as never,
        users as never,
      );
      return { repo, mail, service };
    };

    it('notificação crítica também vai por e-mail', async () => {
      const { repo, mail, service } = setup();
      await service.notifyUsers([3], {
        type: 'training_updated',
        title: 'Treino alterado',
        message: 'Agora às 20:00',
        link: '/agenda',
        critical: true,
      });
      await new Promise((r) => setImmediate(r));
      expect(mail.sendMany).toHaveBeenCalledWith([
        expect.objectContaining({
          to: 'ana@x.com',
          subject: '[CoreSync] Treino alterado',
        }),
      ]);
      // "critical" não é coluna da notificação
      expect(repo.create.mock.calls[0][0]).not.toHaveProperty('critical');
    });

    it('notificação comum não envia e-mail', async () => {
      const { mail, service } = setup();
      await service.notifyUsers([3], {
        type: 'training_created',
        title: 'Novo treino',
        message: 'Vôlei',
      });
      await new Promise((r) => setImmediate(r));
      expect(mail.sendMany).not.toHaveBeenCalled();
    });
  });
});

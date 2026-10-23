import { ConflictException, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';

describe('UserService', () => {
  let repo: Record<string, jest.Mock>;
  let service: UserService;
  const dto = {
    name: 'Ana',
    email: 'ana@x.com',
    password: 'secret1',
    telephone: '1',
    userType: 'aluno' as const,
  };

  beforeEach(() => {
    repo = {
      findOneBy: jest.fn().mockResolvedValue(null),
      create: jest.fn((x) => x),
      save: jest.fn((x) => Promise.resolve({ id: 1, ...x })),
    };
    service = new UserService(repo as never);
  });

  it('armazena a senha com hash', async () => {
    const user = await service.create(dto);
    expect(user.password).not.toBe('secret1');
    expect(user.password).toMatch(/^\$2[aby]\$/);
  });

  it('rejeita e-mail duplicado', async () => {
    repo.findOneBy.mockResolvedValue({ id: 2 });
    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('só admin cria admin', async () => {
    await expect(
      service.create({ ...dto, userType: 'admin' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.create(
        { ...dto, userType: 'admin' },
        { id: 9, email: '', userType: 'admin' },
      ),
    ).resolves.toBeDefined();
  });

  it('aluno não muda o próprio tipo de usuário', async () => {
    await expect(
      service.update(
        1,
        { userType: 'admin' },
        { id: 1, email: '', userType: 'aluno' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

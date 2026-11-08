import { matchActivityToSession } from './session-activity';

const at = (y: number, m: number, d: number, h: number, min = 0) => ({
  startDate: new Date(y, m - 1, d, h, min),
});

describe('matchActivityToSession', () => {
  it('ignora atividades de outros dias', () => {
    expect(
      matchActivityToSession(
        [at(2026, 3, 15, 19), at(2026, 3, 17, 19)],
        '2026-03-16',
        '19:00',
      ),
    ).toBeNull();
  });

  it('retorna a única atividade do dia, mesmo fora do horário', () => {
    const a = at(2026, 3, 16, 7);
    expect(matchActivityToSession([a], '2026-03-16', '19:00')).toBe(a);
  });

  it('com várias no dia, escolhe a mais próxima do horário do treino', () => {
    const morning = at(2026, 3, 16, 7);
    const evening = at(2026, 3, 16, 18, 50);
    expect(
      matchActivityToSession([morning, evening], '2026-03-16', '19:00'),
    ).toBe(evening);
  });

  it('horário inválido cai na primeira do dia', () => {
    const first = at(2026, 3, 16, 7);
    expect(
      matchActivityToSession([first, at(2026, 3, 16, 20)], '2026-03-16', ''),
    ).toBe(first);
  });
});

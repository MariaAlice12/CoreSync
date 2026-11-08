import {
  trainingHappensOn,
  weekdayIndex,
  toISODate,
  parseISODate,
  countSessions,
} from './weekdays';

describe('weekdays', () => {
  it('normaliza nomes com acento, maiúsculas e sufixo "-feira"', () => {
    expect(weekdayIndex('Terça-feira')).toBe(2);
    expect(weekdayIndex('sábado')).toBe(6);
    expect(weekdayIndex('domingo')).toBe(0);
    expect(weekdayIndex('xyz')).toBeUndefined();
  });

  it('verifica se o treino acontece numa data', () => {
    // 2026-10-19 é uma segunda-feira
    expect(trainingHappensOn(['segunda', 'quarta'], '2026-10-19')).toBe(true);
    expect(trainingHappensOn(['terca'], '2026-10-19')).toBe(false);
  });

  it('converte datas sem deslocamento de fuso', () => {
    expect(toISODate(parseISODate('2026-01-01'))).toBe('2026-01-01');
  });

  it('conta as sessões de um intervalo, incluindo as pontas', () => {
    // 2026-11-02 é segunda; até 2026-11-15 (domingo) há 2 segundas e 2 quartas.
    expect(
      countSessions(['segunda', 'quarta'], '2026-11-02', '2026-11-15'),
    ).toBe(4);
    expect(countSessions(['domingo'], '2026-11-15', '2026-11-15')).toBe(1);
    expect(countSessions(['segunda'], '2026-11-03', '2026-11-08')).toBe(0);
  });
});

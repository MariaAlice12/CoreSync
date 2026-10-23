import {
  trainingHappensOn,
  weekdayIndex,
  toISODate,
  parseISODate,
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
});

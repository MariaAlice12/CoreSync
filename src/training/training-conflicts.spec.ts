import {
  describeConflicts,
  findTrainingConflicts,
  normalizeKey,
  TrainingSlot,
} from './training-conflicts';

const base = (over: Partial<TrainingSlot> = {}): TrainingSlot => ({
  id: 1,
  modality: 'Futsal Feminino',
  level: 'intermediario',
  campus: 'Bauru',
  address: 'Quadra Poliesportiva',
  weekdays: ['segunda', 'quarta'],
  hour: '18:30',
  durationMinutes: 90,
  active: true,
  professor: { id: 10, name: 'Paulo' },
  ...over,
});

describe('normalizeKey', () => {
  it('ignora acentos, caixa e espaços extras', () => {
    expect(normalizeKey('  Vôlei   Feminino ')).toBe('volei feminino');
    expect(normalizeKey('judo')).toBe(normalizeKey('Judô'));
  });
});

describe('findTrainingConflicts', () => {
  const existing = base();

  it('turma repetida: mesma modalidade (outra grafia), nível, campus, dia e hora', () => {
    const c = findTrainingConflicts(
      base({
        id: undefined,
        modality: 'futsal  feminino',
        weekdays: ['quarta'],
        professor: { id: 99 },
        address: 'Outra quadra',
      }),
      [existing],
    );
    expect(c.map((x) => x.type)).toEqual(['duplicate']);
    expect(c[0].days).toEqual([3]);
  });

  it('mesma modalidade em outro nível e horário é permitida', () => {
    expect(
      findTrainingConflicts(
        base({
          id: undefined,
          level: 'iniciante',
          hour: '07:00',
          professor: { id: 99 },
        }),
        [existing],
      ),
    ).toEqual([]);
  });

  it('local ocupado: horários sobrepostos no mesmo local e campus', () => {
    const c = findTrainingConflicts(
      base({
        id: undefined,
        modality: 'Handebol',
        hour: '18:00',
        weekdays: ['quarta', 'sexta'],
        professor: { id: 99 },
        address: 'quadra poliesportiva',
      }),
      [existing],
    );
    expect(c.map((x) => x.type)).toEqual(['location']);
  });

  it('mesmo local em outro campus não conflita', () => {
    expect(
      findTrainingConflicts(
        base({
          id: undefined,
          modality: 'Handebol',
          campus: 'Botucatu',
          professor: { id: 99 },
        }),
        [existing],
      ),
    ).toEqual([]);
  });

  it('terminar 20:00 e começar 20:00 não é sobreposição', () => {
    expect(
      findTrainingConflicts(
        base({
          id: undefined,
          modality: 'Futsal Masculino',
          hour: '20:00',
          professor: { id: 10 },
        }),
        [existing],
      ),
    ).toEqual([]);
  });

  it('duração curta evita o choque; duração longa provoca', () => {
    const early = base({
      id: undefined,
      modality: 'Handebol',
      hour: '17:30',
      professor: { id: 99 },
    });
    expect(
      findTrainingConflicts({ ...early, durationMinutes: 60 }, [existing]),
    ).toEqual([]);
    expect(
      findTrainingConflicts({ ...early, durationMinutes: 61 }, [existing]),
    ).toHaveLength(1);
  });

  it('professor ocupado em outro local', () => {
    const c = findTrainingConflicts(
      base({
        id: undefined,
        modality: 'Basquete',
        address: 'Ginásio',
        hour: '19:00',
        weekdays: ['segunda'],
      }),
      [existing],
    );
    expect(c.map((x) => x.type)).toEqual(['professor']);
  });

  it('local e professor ao mesmo tempo geram dois conflitos', () => {
    const c = findTrainingConflicts(
      base({ id: undefined, modality: 'Basquete', hour: '19:00' }),
      [existing],
    );
    expect(c.map((x) => x.type).sort()).toEqual(['location', 'professor']);
  });

  it('dias com e sem acento são o mesmo dia', () => {
    const c = findTrainingConflicts(
      base({
        id: undefined,
        modality: 'Basquete',
        weekdays: ['terça'],
        professor: { id: 99 },
      }),
      [base({ weekdays: ['terca'] })],
    );
    expect(c).toHaveLength(1);
  });

  it('ignora o próprio treino (edição) e treinos inativos', () => {
    expect(findTrainingConflicts(existing, [existing])).toEqual([]);
    expect(
      findTrainingConflicts(base({ id: 2 }), [base({ active: false })]),
    ).toEqual([]);
  });

  it('candidato inativo não é checado', () => {
    expect(
      findTrainingConflicts(base({ id: 2, active: false }), [existing]),
    ).toEqual([]);
  });

  it('sem dia em comum não conflita', () => {
    expect(
      findTrainingConflicts(base({ id: 2, weekdays: ['terca'] }), [existing]),
    ).toEqual([]);
  });
});

describe('describeConflicts', () => {
  it('descreve local, dias e intervalo', () => {
    const [msg] = describeConflicts(
      findTrainingConflicts(
        base({
          id: undefined,
          modality: 'Handebol',
          hour: '18:00',
          weekdays: ['quarta'],
          professor: { id: 99 },
        }),
        [base()],
      ),
    );
    expect(msg).toBe(
      'O local Quadra Poliesportiva já está ocupado por Futsal Feminino (prof. Paulo): quarta, das 18:30 às 20:00.',
    );
  });
});

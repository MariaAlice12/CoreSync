import { weekdayIndex } from 'src/attendance/weekdays';

export const DEFAULT_DURATION_MINUTES = 90;

/** Campos do treino usados na checagem de conflitos. */
export interface TrainingSlot {
  id?: number;
  modality: string;
  campus?: string | null;
  address: string;
  weekdays: string[];
  hour: string;
  durationMinutes?: number | null;
  active?: boolean;
  professor?: { id: number; name?: string } | null;
}

export type ConflictType = 'duplicate' | 'location' | 'professor';

export interface TrainingConflict {
  type: ConflictType;
  training: TrainingSlot;
  /** Dias (índice de Date.getDay) em que há choque */
  days: number[];
}

const DAY_NAMES = [
  'domingo',
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
];

/** "Vôlei  Feminino " → "volei feminino": compara ignorando acentos, caixa e espaços. */
export function normalizeKey(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function toMinutes(hour: string): number {
  const [h, m] = hour.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function interval(t: TrainingSlot): [number, number] {
  const start = toMinutes(t.hour);
  return [start, start + (t.durationMinutes || DEFAULT_DURATION_MINUTES)];
}

function days(t: TrainingSlot): Set<number> {
  return new Set(
    t.weekdays.map(weekdayIndex).filter((d): d is number => d !== undefined),
  );
}

/**
 * Compara o treino candidato com os demais e devolve os conflitos:
 * - duplicate: mesma modalidade, nível e campus, no mesmo dia e horário de início (turma repetida);
 * - location: mesmo local e campus com horário sobreposto;
 * - professor: mesmo professor com horário sobreposto.
 * Treinos inativos e o próprio candidato (na edição) são ignorados.
 * Os intervalos são [início, fim): terminar às 19:30 e começar às 19:30 não conflita.
 */
export function findTrainingConflicts(
  candidate: TrainingSlot,
  others: TrainingSlot[],
): TrainingConflict[] {
  if (candidate.active === false) return [];
  const cDays = days(candidate);
  const [cStart, cEnd] = interval(candidate);
  const conflicts: TrainingConflict[] = [];

  for (const other of others) {
    if (other.active === false) continue;
    if (candidate.id !== undefined && other.id === candidate.id) continue;

    const shared = [...days(other)].filter((d) => cDays.has(d)).sort();
    if (shared.length === 0) continue;

    const [oStart, oEnd] = interval(other);
    const overlaps = cStart < oEnd && oStart < cEnd;
    const sameCampus =
      normalizeKey(candidate.campus) === normalizeKey(other.campus);

    if (
      cStart === oStart &&
      sameCampus &&
      normalizeKey(candidate.modality) === normalizeKey(other.modality)
    ) {
      conflicts.push({ type: 'duplicate', training: other, days: shared });
      continue; // a turma repetida já explica o choque de local/professor
    }
    if (
      overlaps &&
      sameCampus &&
      normalizeKey(candidate.address) === normalizeKey(other.address)
    ) {
      conflicts.push({ type: 'location', training: other, days: shared });
    }
    if (
      overlaps &&
      candidate.professor?.id !== undefined &&
      candidate.professor.id === other.professor?.id
    ) {
      conflicts.push({ type: 'professor', training: other, days: shared });
    }
  }
  return conflicts;
}

function describeSlot(t: TrainingSlot, dayList: number[]) {
  const [start, end] = interval(t);
  const daysText = dayList.map((d) => DAY_NAMES[d]).join(', ');
  return `${daysText}, das ${formatMinutes(start)} às ${formatMinutes(end)}`;
}

/** Mensagens em português, uma por conflito. */
export function describeConflicts(conflicts: TrainingConflict[]): string[] {
  return conflicts.map(({ type, training: t, days: d }) => {
    const prof = t.professor?.name ? ` (prof. ${t.professor.name})` : '';
    const when = describeSlot(t, d);
    switch (type) {
      case 'duplicate':
        return `Já existe uma turma de ${t.modality} no mesmo horário: ${when}${prof}.`;
      case 'location':
        return `O local ${t.address} já está ocupado por ${t.modality}${prof}: ${when}.`;
      case 'professor':
        return `${t.professor?.name ?? 'O professor'} já dá ${t.modality} em ${t.address} neste horário: ${when}.`;
    }
  });
}

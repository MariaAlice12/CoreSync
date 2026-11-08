import { Strava } from 'src/strava/entities/strava.entity';
import { toISODate } from './weekdays';

/** Resumo da atividade do Strava exibido junto da presença na sessão. */
export interface SessionActivity {
  id: number;
  stravaId: string;
  name: string;
  type: string;
  distance: number;
  movingTime: number;
  pace: number | null;
  averageHeartrate: number | null;
  startDate: Date;
}

function minutesOfDay(hour: string): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(hour ?? '');
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

/**
 * Escolhe, entre as atividades do atleta, a que corresponde à sessão de treino:
 * iniciada no mesmo dia (data local do servidor) e, havendo várias, a mais
 * próxima do horário do treino.
 */
export function matchActivityToSession<T extends Pick<Strava, 'startDate'>>(
  activities: T[],
  date: string,
  hour: string,
): T | null {
  const sameDay = activities.filter(
    (a) => toISODate(new Date(a.startDate)) === date,
  );
  if (sameDay.length <= 1) return sameDay[0] ?? null;

  const target = minutesOfDay(hour);
  if (target === null) return sameDay[0];
  const distance = (a: T) => {
    const d = new Date(a.startDate);
    return Math.abs(d.getHours() * 60 + d.getMinutes() - target);
  };
  return sameDay.reduce((best, a) => (distance(a) < distance(best) ? a : best));
}

export function toSessionActivity(a: Strava): SessionActivity {
  return {
    id: a.id,
    stravaId: a.stravaId,
    name: a.name,
    type: a.type,
    distance: a.distance,
    movingTime: a.movingTime,
    pace: a.distance > 0 ? a.movingTime / (a.distance / 1000) : null,
    averageHeartrate: a.averageHeartrate ?? null,
    startDate: a.startDate,
  };
}

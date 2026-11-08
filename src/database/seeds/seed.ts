/**
 * Dados de exemplo para avaliar o sistema (BI, presença, desempenho, Strava,
 * eventos e notificações) com um volume realista.
 *
 *   npm run seed        apaga o seed anterior e gera de novo
 *   npm run seed:clear  apaga só o que o seed criou
 *
 * Tudo o que é criado aqui pertence a usuários com e-mail @seed.coresync;
 * os demais dados do banco não são alterados. Senha de todos: 123456.
 */
import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import { DataSource, EntityManager, In, Like } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import { User } from 'src/user/entities/user.entity';
import { Training } from 'src/training/entities/training.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { PerformanceRecord } from 'src/performance/entities/performance-record.entity';
import { Strava } from 'src/strava/entities/strava.entity';
import { Event } from 'src/event/entities/event.entity';
import { EventRegistration } from 'src/event-registration/entities/event-registration.entity';
import { TournamentBracket } from 'src/tournament-bracket/entities/tournament-bracket.entity';
import { BracketType } from 'src/tournament-bracket/dto/create-tournament-bracket.dto';
import { SurveyResponse } from 'src/survey/entities/survey-response.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { toISODate, trainingHappensOn } from 'src/attendance/weekdays';

const DOMAIN = '@seed.coresync';
const PASSWORD = '123456';
const ATHLETES = 150;
const HISTORY_WEEKS = 12;

// ---------- aleatoriedade reprodutível ----------

let state = 20261108;
function rand() {
  // mulberry32
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const int = (min: number, max: number) =>
  min + Math.floor(rand() * (max - min + 1));
const pick = <T>(list: readonly T[]): T =>
  list[Math.floor(rand() * list.length)];
const chance = (p: number) => rand() < p;
function weighted<T>(options: [T, number][]): T {
  let r = rand() * options.reduce((s, [, w]) => s + w, 0);
  for (const [value, w] of options) {
    r -= w;
    if (r <= 0) return value;
  }
  return options[options.length - 1][0];
}
function sample<T>(list: readonly T[], n: number): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

// ---------- datas ----------

const today = new Date();
today.setHours(12, 0, 0, 0);
function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
function at(date: Date, hour: string, plusMinutes = 0) {
  const [h, m] = hour.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m + plusMinutes, 0, 0);
  return d;
}

// ---------- dados base ----------

const FIRST_F = [
  'Ana',
  'Beatriz',
  'Camila',
  'Larissa',
  'Mariana',
  'Gabriela',
  'Juliana',
  'Isabela',
  'Letícia',
  'Amanda',
  'Bruna',
  'Carolina',
  'Fernanda',
  'Giovanna',
  'Helena',
  'Laura',
  'Lívia',
  'Manuela',
  'Natália',
  'Rafaela',
  'Sofia',
  'Thaís',
  'Vitória',
  'Yasmin',
  'Clara',
  'Débora',
  'Elisa',
  'Heloísa',
];
const FIRST_M = [
  'Lucas',
  'Gabriel',
  'Pedro',
  'Matheus',
  'Rafael',
  'Guilherme',
  'Felipe',
  'Gustavo',
  'João',
  'Leonardo',
  'Bruno',
  'Thiago',
  'Vinícius',
  'Eduardo',
  'Henrique',
  'Igor',
  'Caio',
  'Daniel',
  'Diego',
  'Enzo',
  'Fábio',
  'Murilo',
  'Otávio',
  'Renan',
  'Samuel',
  'Vitor',
  'Arthur',
  'Davi',
];
const LAST = [
  'Silva',
  'Santos',
  'Oliveira',
  'Souza',
  'Rodrigues',
  'Ferreira',
  'Alves',
  'Pereira',
  'Lima',
  'Gomes',
  'Costa',
  'Ribeiro',
  'Martins',
  'Carvalho',
  'Almeida',
  'Lopes',
  'Soares',
  'Fernandes',
  'Vieira',
  'Barbosa',
  'Rocha',
  'Dias',
  'Nascimento',
  'Andrade',
  'Moreira',
  'Nunes',
  'Marques',
  'Machado',
  'Mendes',
  'Freitas',
  'Cardoso',
  'Ramos',
  'Teixeira',
  'Moura',
  'Campos',
  'Pinto',
];

const COURSES: [string, number][] = [
  ['Sistemas de Informação', 14],
  ['Ciência da Computação', 12],
  ['Educação Física', 18],
  ['Engenharia Civil', 8],
  ['Engenharia Elétrica', 7],
  ['Engenharia Mecânica', 7],
  ['Engenharia de Produção', 6],
  ['Design', 6],
  ['Jornalismo', 5],
  ['Arquitetura e Urbanismo', 5],
  ['Psicologia', 6],
  ['Física', 3],
  ['Matemática', 3],
  ['Química', 3],
  ['Ciências Biológicas', 4],
  ['Relações Públicas', 3],
];
const SHIFTS: [string, number][] = [
  ['integral', 40],
  ['noite', 35],
  ['manha', 15],
  ['tarde', 10],
];
const CAMPI: [string, number][] = [
  ['Bauru', 88],
  ['Botucatu', 7],
  ['Marília', 5],
];

type Profile = 'assiduo' | 'regular' | 'irregular' | 'desistente';
const PROFILE_RATE: Record<Profile, number> = {
  assiduo: 0.9,
  regular: 0.7,
  irregular: 0.4,
  desistente: 0.75,
};

const PROFESSORS = [
  { name: 'Ricardo Almeida', gender: 'm' },
  { name: 'Fernanda Lima', gender: 'f' },
  { name: 'Paulo Mendes', gender: 'm' },
  { name: 'Juliana Rocha', gender: 'f' },
  { name: 'André Souza', gender: 'm' },
  { name: 'Camila Ferreira', gender: 'f' },
  { name: 'Marcos Oliveira', gender: 'm' },
  { name: 'Luciana Castro', gender: 'f' },
] as const;

type Gender = 'f' | 'm' | 'x';
interface TrainingSeed {
  modality: string;
  level: 'iniciante' | 'intermediario' | 'avancado';
  hour: string;
  weekdays: string[];
  address: string;
  max: number;
  min: number;
  prof: number;
  gender: Gender;
  campus?: string;
  active?: boolean;
  strava?: 'run' | 'swim';
  description: string;
}

const TRAININGS: TrainingSeed[] = [
  {
    modality: 'Vôlei Feminino',
    level: 'avancado',
    hour: '19:30',
    weekdays: ['segunda', 'quarta'],
    address: 'Ginásio da FC',
    max: 15,
    min: 12,
    prof: 1,
    gender: 'f',
    description: 'Time principal, preparação para o InterUnesp.',
  },
  {
    modality: 'Vôlei Feminino',
    level: 'iniciante',
    hour: '18:00',
    weekdays: ['terca', 'quinta'],
    address: 'Ginásio da FC',
    max: 18,
    min: 8,
    prof: 1,
    gender: 'f',
    description: 'Fundamentos: toque, manchete e saque.',
  },
  {
    modality: 'Vôlei Masculino',
    level: 'intermediario',
    hour: '21:00',
    weekdays: ['segunda', 'quarta'],
    address: 'Ginásio da FC',
    max: 15,
    min: 10,
    prof: 0,
    gender: 'm',
    description: 'Sistema 5x1 e transição.',
  },
  {
    modality: 'Futsal Masculino',
    level: 'avancado',
    hour: '20:00',
    weekdays: ['terca', 'quinta'],
    address: 'Quadra Poliesportiva',
    max: 16,
    min: 10,
    prof: 2,
    gender: 'm',
    description: 'Treino tático e jogo-treino.',
  },
  {
    modality: 'Futsal Feminino',
    level: 'intermediario',
    hour: '18:30',
    weekdays: ['segunda', 'quarta'],
    address: 'Quadra Poliesportiva',
    max: 16,
    min: 8,
    prof: 2,
    gender: 'f',
    description: 'Passe, finalização e jogo reduzido.',
  },
  {
    modality: 'Basquete',
    level: 'intermediario',
    hour: '19:00',
    weekdays: ['terca', 'sexta'],
    address: 'Ginásio da FC',
    max: 15,
    min: 8,
    prof: 3,
    gender: 'x',
    description: 'Arremesso, bandeja e defesa individual.',
  },
  {
    modality: 'Basquete',
    level: 'iniciante',
    hour: '12:30',
    weekdays: ['quarta'],
    address: 'Quadra Externa',
    max: 20,
    min: 6,
    prof: 3,
    gender: 'x',
    description: 'Basquete no horário do almoço, aberto a todos.',
  },
  {
    modality: 'Handebol',
    level: 'intermediario',
    hour: '18:00',
    weekdays: ['quarta', 'sexta'],
    address: 'Quadra Poliesportiva',
    max: 16,
    min: 10,
    prof: 1,
    gender: 'x',
    description: 'Ataque posicional e contra-ataque.',
  },
  {
    modality: 'Natação',
    level: 'iniciante',
    hour: '07:00',
    weekdays: ['terca', 'quinta'],
    address: 'Piscina Semiolímpica',
    max: 12,
    min: 4,
    prof: 4,
    gender: 'x',
    strava: 'swim',
    description: 'Adaptação ao meio líquido e crawl.',
  },
  {
    modality: 'Natação',
    level: 'avancado',
    hour: '06:30',
    weekdays: ['segunda', 'quarta', 'sexta'],
    address: 'Piscina Semiolímpica',
    max: 10,
    min: 4,
    prof: 4,
    gender: 'x',
    strava: 'swim',
    description: 'Séries intervaladas, foco em 50 m e 100 m livre.',
  },
  {
    modality: 'Corrida',
    level: 'iniciante',
    hour: '07:00',
    weekdays: ['sabado'],
    address: 'Pista de Atletismo',
    max: 30,
    min: 5,
    prof: 5,
    gender: 'x',
    strava: 'run',
    description: 'Do zero aos 5 km.',
  },
  {
    modality: 'Corrida',
    level: 'intermediario',
    hour: '18:00',
    weekdays: ['terca', 'quinta'],
    address: 'Pista de Atletismo',
    max: 25,
    min: 5,
    prof: 5,
    gender: 'x',
    strava: 'run',
    description: 'Treinos de ritmo e longões para 10 km.',
  },
  {
    modality: 'Atletismo',
    level: 'avancado',
    hour: '17:00',
    weekdays: ['segunda', 'quarta'],
    address: 'Pista de Atletismo',
    max: 12,
    min: 4,
    prof: 5,
    gender: 'x',
    strava: 'run',
    description: 'Velocidade e saída de bloco.',
  },
  {
    modality: 'Judô',
    level: 'iniciante',
    hour: '19:00',
    weekdays: ['segunda', 'quinta'],
    address: 'Sala de Lutas',
    max: 20,
    min: 6,
    prof: 6,
    gender: 'x',
    description: 'Quedas, imobilizações e graduação.',
  },
  {
    modality: 'Xadrez',
    level: 'intermediario',
    hour: '17:30',
    weekdays: ['sexta'],
    address: 'Biblioteca - Sala 2',
    max: 24,
    min: 4,
    prof: 7,
    gender: 'x',
    description: 'Aberturas, finais e partidas rápidas.',
  },
  {
    modality: 'Vôlei de Praia',
    level: 'iniciante',
    hour: '17:00',
    weekdays: ['sabado'],
    address: 'Quadra de Areia',
    max: 12,
    min: 4,
    prof: 0,
    gender: 'x',
    campus: 'Botucatu',
    description: 'Treino aberto no campus de Botucatu.',
  },
  {
    modality: 'Tênis de Mesa',
    level: 'iniciante',
    hour: '12:00',
    weekdays: ['terca'],
    address: 'Centro de Convivência',
    max: 10,
    min: 4,
    prof: 7,
    gender: 'x',
    active: false,
    description: 'Suspenso até a reforma das mesas.',
  },
];

const NOTES: Record<string, string[]> = {
  default: [
    'Boa evolução, manter a intensidade.',
    'Chegou atrasado, perdeu o aquecimento.',
    'Excelente comprometimento no treino.',
    'Precisa melhorar o condicionamento.',
    'Ótima comunicação com a equipe.',
    'Sentiu desconforto no joelho; acompanhar.',
    'Treino abaixo do esperado, parecia cansado.',
    'Destaque da sessão.',
  ],
  Vôlei: [
    'Recepção mais consistente.',
    'Ajustar o tempo de bloqueio.',
    'Saque viagem entrando bem.',
    'Precisa se posicionar melhor na defesa.',
  ],
  Natação: [
    'Virada olímpica melhorou.',
    'Respiração bilateral ainda irregular.',
    'Bom ritmo nas séries de 100 m.',
  ],
  Corrida: [
    'Ritmo constante nos tiros.',
    'Saiu forte demais no início.',
    'Boa cadência, postura melhorou.',
  ],
  Xadrez: [
    'Estudar finais de torre.',
    'Boa leitura de abertura.',
    'Perdeu no tempo, gerenciar o relógio.',
  ],
};

function metricsFor(modality: string, skill: number) {
  const s = Math.max(0, Math.min(1, skill));
  if (modality.startsWith('Vôlei'))
    return [
      {
        name: 'Saques certos',
        value: Math.round(6 + s * 10 + rand() * 3),
        unit: 'de 20',
      },
      {
        name: 'Recepções boas',
        value: Math.round(30 + s * 50 + rand() * 10),
        unit: '%',
      },
    ];
  if (modality.startsWith('Futsal') || modality === 'Handebol')
    return [
      { name: 'Gols', value: int(0, Math.round(1 + s * 3)) },
      {
        name: 'Passes certos',
        value: Math.round(55 + s * 35 + rand() * 5),
        unit: '%',
      },
    ];
  if (modality === 'Basquete')
    return [
      {
        name: 'Lances livres',
        value: Math.round(3 + s * 6 + rand() * 2),
        unit: 'de 10',
      },
    ];
  if (modality === 'Natação')
    return [
      {
        name: '50 m livre',
        value: Math.round((48 - s * 18 + rand() * 3) * 10) / 10,
        unit: 's',
      },
    ];
  if (modality === 'Atletismo')
    return [
      {
        name: '100 m',
        value: Math.round((15.5 - s * 3.5 + rand() * 0.5) * 100) / 100,
        unit: 's',
      },
    ];
  if (modality === 'Xadrez')
    return [
      {
        name: 'Partidas vencidas',
        value: int(0, 2 + Math.round(s * 3)),
        unit: 'de 5',
      },
    ];
  if (modality === 'Judô')
    return [{ name: 'Ippons', value: int(0, 1 + Math.round(s * 3)) }];
  return [];
}

const SURVEY_COMMENTS = [
  'Professor muito atencioso!',
  'Horário ótimo para quem estuda à noite.',
  'Poderia ter mais vagas.',
  'Treino muito puxado, mas vale a pena.',
  'Gostaria de mais jogos-treino.',
  'Ambiente acolhedor para iniciantes.',
  'A quadra precisa de manutenção.',
  'Melhor parte da semana!',
  null,
  null,
  null,
];

function slug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]+/g, '.');
}

async function insertChunks<T>(
  m: EntityManager,
  entity: new () => T,
  rows: object[],
  size = 500,
) {
  const ids: number[] = [];
  for (let i = 0; i < rows.length; i += size) {
    const res = await m.insert(entity, rows.slice(i, i + size) as never);
    ids.push(...res.identifiers.map((r) => r.id as number));
  }
  return ids;
}

// ---------- limpeza ----------

async function clear(m: EntityManager) {
  const users = await m.find(User, {
    where: { email: Like(`%${DOMAIN}`) },
    select: { id: true },
  });
  if (users.length === 0) return 0;
  const ids = users.map((u) => u.id);

  const events = await m.find(Event, {
    where: { user: { id: In(ids) } },
    relations: { tournamentBracket: true },
  });
  const brackets = events
    .map((e) => e.tournamentBracket?.id)
    .filter((id): id is string => !!id);
  if (events.length)
    await m.delete(
      Event,
      events.map((e) => e.id),
    );
  if (brackets.length) await m.delete(TournamentBracket, brackets);

  // Treinos dos professores do seed (presenças, matrículas, avaliações e desempenho saem em cascata)
  await m
    .createQueryBuilder()
    .delete()
    .from(Training)
    .where('professorId IN (:...ids)', { ids })
    .execute();

  for (const entity of [Enrollment, EventRegistration, SurveyResponse]) {
    await m
      .createQueryBuilder()
      .delete()
      .from(entity)
      .where('userId IN (:...ids)', { ids })
      .execute();
  }
  await m.delete(User, ids);
  return ids.length;
}

// ---------- geração ----------

async function seed(m: EntityManager) {
  const hash = await bcrypt.hash(PASSWORD, 10);
  const usedEmails = new Set<string>();
  const email = (name: string) => {
    const base = slug(name).replace(/^\.|\.$/g, '');
    let e = `${base}${DOMAIN}`;
    for (let n = 2; usedEmails.has(e); n++) e = `${base}${n}${DOMAIN}`;
    usedEmails.add(e);
    return e;
  };
  const phone = () => `(14) 9${int(8000, 9999)}-${int(1000, 9999)}`;
  const createdAt = addDays(today, -HISTORY_WEEKS * 7 - 14);

  // Professores
  const profEmails = PROFESSORS.map((p) => email(p.name));
  const profIds = await insertChunks(
    m,
    User,
    PROFESSORS.map((p, i) => ({
      name: p.name,
      email: profEmails[i],
      password: hash,
      userType: 'professor',
      telephone: phone(),
      campus: 'Bauru',
      createdAt,
    })),
  );

  // Atletas
  interface AthleteSeed {
    id: number;
    name: string;
    email: string;
    gender: 'f' | 'm';
    profile: Profile;
    skill: number;
    campus: string;
  }
  const athleteRows: (Omit<AthleteSeed, 'id'> & {
    course: string;
    shift: string;
  })[] = [];
  for (let i = 0; i < ATHLETES; i++) {
    const gender = chance(0.52) ? 'f' : 'm';
    const name = `${pick(gender === 'f' ? FIRST_F : FIRST_M)} ${pick(LAST)} ${pick(LAST)}`;
    athleteRows.push({
      name,
      email: email(name),
      gender,
      course: weighted(COURSES),
      shift: weighted(SHIFTS),
      campus: weighted(CAMPI),
      profile: weighted<Profile>([
        ['assiduo', 25],
        ['regular', 40],
        ['irregular', 25],
        ['desistente', 10],
      ]),
      skill: rand() * 0.6,
    });
  }
  const athleteIds = await insertChunks(
    m,
    User,
    athleteRows.map((a) => ({
      name: a.name,
      email: a.email,
      password: hash,
      userType: 'aluno',
      telephone: phone(),
      course: a.course,
      shift: a.shift,
      campus: a.campus,
      createdAt: addDays(createdAt, int(0, 10)),
    })),
  );
  const athletes: AthleteSeed[] = athleteRows.map((a, i) => ({
    ...a,
    id: athleteIds[i],
  }));

  // Treinos
  const trainingIds = await insertChunks(
    m,
    Training,
    TRAININGS.map((t) => ({
      modality: t.modality,
      level: t.level,
      hour: t.hour,
      weekdays: t.weekdays,
      address: t.address,
      description: t.description,
      maxStudents: t.max,
      minStudents: t.min,
      campus: t.campus ?? 'Bauru',
      active: t.active ?? true,
      professor: { id: profIds[t.prof] },
      createdAt,
    })),
  );
  const trainings = TRAININGS.map((t, i) => ({
    ...t,
    id: trainingIds[i],
    members: [] as { athlete: AthleteSeed; since: Date; until: Date | null }[],
  }));

  // Matrículas (respeitando vagas e gênero da modalidade)
  for (const athlete of athletes) {
    const wanted = weighted([
      [1, 45],
      [2, 40],
      [3, 15],
    ]);
    // Atletas de Botucatu treinam lá; os demais (inclusive Marília) treinam em Bauru.
    const campus = athlete.campus === 'Botucatu' ? 'Botucatu' : 'Bauru';
    const options = trainings.filter(
      (t) =>
        (t.gender === 'x' || t.gender === athlete.gender) &&
        (t.campus ?? 'Bauru') === campus,
    );
    for (const t of sample(options, wanted)) {
      if (t.members.length >= t.max) continue;
      const since = addDays(today, -HISTORY_WEEKS * 7 - int(-20, 7));
      const cancels =
        athlete.profile === 'desistente' ? chance(0.6) : chance(0.05);
      const until = cancels
        ? addDays(today, -int(5, HISTORY_WEEKS * 7 - 21))
        : null;
      t.members.push({ athlete, since, until });
    }
  }
  await insertChunks(
    m,
    Enrollment,
    trainings.flatMap((t) =>
      t.members.map((mb) => ({
        user: { id: mb.athlete.id },
        training: { id: t.id },
        active: mb.until === null,
        date: mb.since,
        createdAt: mb.since,
        updatedAt: mb.until ?? mb.since,
      })),
    ),
  );

  // Presenças, desempenho e Strava
  const attendanceRows: {
    user: { id: number };
    training: { id: number };
    date: string;
    createdAt: Date;
  }[] = [];
  const meta: {
    training: (typeof trainings)[number];
    athlete: AthleteSeed;
    day: Date;
    progress: number;
  }[] = [];
  const start = addDays(today, -HISTORY_WEEKS * 7);
  const horizon = addDays(today, 6);
  for (const t of trainings) {
    if (t.active === false) continue;
    for (let day = new Date(start); day <= horizon; day = addDays(day, 1)) {
      const iso = toISODate(day);
      if (!trainingHappensOn(t.weekdays, iso)) continue;
      const future = day > today;
      const progress =
        (day.getTime() - start.getTime()) / (today.getTime() - start.getTime());
      for (const mb of t.members) {
        if (day < mb.since || (mb.until && day > mb.until)) continue;
        let p = PROFILE_RATE[mb.athlete.profile];
        if (mb.athlete.profile === 'desistente')
          p *= Math.max(0.1, 1 - progress);
        if (future) p *= 0.75;
        if (!chance(p)) continue;
        attendanceRows.push({
          user: { id: mb.athlete.id },
          training: { id: t.id },
          date: iso,
          createdAt: addDays(day, -int(0, 3)),
        });
        meta.push({
          training: t,
          athlete: mb.athlete,
          day,
          progress: Math.min(1, progress),
        });
      }
    }
  }
  const attendanceIds = await insertChunks(m, Attendance, attendanceRows);

  const performanceRows: object[] = [];
  const stravaRows: object[] = [];
  const stravaAthletes = new Set(
    sample(
      athletes.filter((a) =>
        trainings.some(
          (t) => t.strava && t.members.some((mb) => mb.athlete === a),
        ),
      ),
      25,
    ).map((a) => a.id),
  );
  let stravaId = 9100000000 + int(0, 99999);

  const activity = (
    athlete: AthleteSeed,
    kind: 'run' | 'swim',
    when: Date,
    progress: number,
  ) => {
    const fitness =
      athlete.skill + progress * (athlete.profile === 'assiduo' ? 0.35 : 0.15);
    if (kind === 'swim') {
      const distance = int(10, 25) * 100;
      const pacePer100 = 150 - fitness * 45 + rand() * 12; // s/100 m
      const moving = Math.round((distance / 100) * pacePer100);
      return {
        stravaId: String(stravaId++),
        name: pick([
          'Natação matinal',
          'Treino de piscina',
          'Séries de 100 m',
          'Natação - técnica',
        ]),
        type: 'Swim',
        sportType: 'Swim',
        distance,
        movingTime: moving,
        elapsedTime: moving + int(120, 600),
        totalElevationGain: 0,
        averageSpeed: distance / moving,
        maxSpeed: (distance / moving) * 1.3,
        averageHeartrate: Math.round(128 + rand() * 25),
        maxHeartrate: Math.round(160 + rand() * 20),
        averageCadence: null,
        startDate: when,
        user: { id: athlete.id },
      };
    }
    const distance = Math.round((3 + fitness * 7 + rand() * 4) * 1000);
    const pace = 420 - fitness * 120 + rand() * 30; // s/km
    const moving = Math.round((distance / 1000) * pace);
    return {
      stravaId: String(stravaId++),
      name: pick([
        'Corrida na pista',
        'Treino de ritmo',
        'Rodagem leve',
        'Tiros de 400 m',
        'Longão',
        'Corrida no campus',
      ]),
      type: 'Run',
      sportType: 'Run',
      distance,
      movingTime: moving,
      elapsedTime: moving + int(60, 420),
      totalElevationGain: int(5, 60),
      averageSpeed: distance / moving,
      maxSpeed: (distance / moving) * 1.35,
      averageHeartrate: Math.round(170 - fitness * 25 + rand() * 10),
      maxHeartrate: Math.round(185 + rand() * 10),
      averageCadence: Math.round(78 + fitness * 10 + rand() * 4),
      startDate: when,
      user: { id: athlete.id },
    };
  };

  meta.forEach((x, i) => {
    if (x.day >= today) return;
    const growth =
      x.athlete.profile === 'assiduo'
        ? 0.4
        : x.athlete.profile === 'regular'
          ? 0.25
          : 0.05;
    const skill = x.athlete.skill + x.progress * growth;
    if (chance(0.4)) {
      const rating = Math.max(
        1,
        Math.min(5, Math.round(1.8 + skill * 4 + (rand() - 0.5) * 1.4)),
      );
      const base = Object.keys(NOTES).find((k) =>
        x.training.modality.startsWith(k),
      );
      performanceRows.push({
        attendance: { id: attendanceIds[i] },
        rating,
        notes: chance(0.45)
          ? pick([...NOTES.default, ...(base ? NOTES[base] : [])])
          : null,
        metrics: chance(0.6) ? metricsFor(x.training.modality, skill) : [],
        recordedBy: { id: profIds[x.training.prof] },
        createdAt: at(x.day, '23:00'),
        updatedAt: at(x.day, '23:00'),
      });
    }
    if (x.training.strava && stravaAthletes.has(x.athlete.id) && chance(0.8)) {
      stravaRows.push(
        activity(
          x.athlete,
          x.training.strava,
          at(x.day, x.training.hour, int(-5, 15)),
          x.progress,
        ),
      );
    }
  });
  // Atividades avulsas (fora dos treinos)
  for (const a of athletes.filter((x) => stravaAthletes.has(x.id))) {
    for (let w = 0; w < HISTORY_WEEKS; w++) {
      if (!chance(0.6)) continue;
      const day = addDays(start, w * 7 + int(0, 6));
      if (day >= today) continue;
      stravaRows.push(
        activity(
          a,
          chance(0.8) ? 'run' : 'swim',
          at(day, pick(['06:00', '06:30', '17:30', '19:00'])),
          w / HISTORY_WEEKS,
        ),
      );
    }
  }
  await insertChunks(m, PerformanceRecord, performanceRows);
  await insertChunks(m, Strava, stravaRows);

  // Avaliações dos treinos
  const surveyRows: object[] = [];
  for (const t of trainings) {
    for (const mb of sample(
      t.members,
      Math.min(t.members.length, int(4, 12)),
    )) {
      surveyRows.push({
        training: { id: t.id },
        user: { id: mb.athlete.id },
        rating: weighted([
          [5, 45],
          [4, 35],
          [3, 13],
          [2, 5],
          [1, 2],
        ]),
        comment: pick(SURVEY_COMMENTS),
        createdAt: addDays(today, -int(1, 60)),
      });
    }
  }
  await insertChunks(m, SurveyResponse, surveyRows);

  // Eventos
  const EVENTS = [
    {
      title: 'Interclasse 2026',
      description: 'Torneio de futsal e vôlei entre os cursos do campus.',
      days: -60,
      hour: '08:00',
      location: 'Ginásio da FC',
      orgs: [2, 1],
      regs: 70,
      bracket: { type: BracketType.SINGLE_ELIMINATION, teams: 8 },
    },
    {
      title: 'Corrida da Atlética 5K',
      description: 'Corrida aberta à comunidade, com kit e medalha.',
      days: -25,
      hour: '07:00',
      location: 'Pista de Atletismo',
      orgs: [5],
      regs: 60,
    },
    {
      title: 'Torneio de Xadrez Relâmpago',
      description: 'Partidas de 5 minutos, sistema todos contra todos.',
      days: -10,
      hour: '14:00',
      location: 'Biblioteca - Sala 2',
      orgs: [7],
      regs: 16,
      bracket: { type: BracketType.ROUND_ROBIN, teams: 6 },
    },
    {
      title: 'Copa UNESP de Vôlei',
      description: 'Copa com equipes de Bauru, Botucatu e Marília.',
      days: 5,
      hour: '09:00',
      location: 'Ginásio da FC',
      orgs: [1, 0],
      regs: 40,
      bracket: { type: BracketType.DOUBLE_ELIMINATION, teams: 8 },
    },
    {
      title: 'Festival de Natação',
      description: 'Provas de 50 m e 100 m livre para todos os níveis.',
      days: 12,
      hour: '08:00',
      location: 'Piscina Semiolímpica',
      orgs: [4],
      regs: 25,
    },
    {
      title: 'Treinão Aberto da Atlética',
      description: 'Dia de experimentar todas as modalidades.',
      days: 20,
      hour: '15:00',
      location: 'Centro Esportivo',
      orgs: [0, 3, 5],
      regs: 55,
    },
    {
      title: 'InterUnesp - Seletiva',
      description:
        'Seletiva das equipes que representarão Bauru no InterUnesp.',
      days: 35,
      hour: '18:00',
      location: 'Quadra Poliesportiva',
      orgs: [2, 3],
      regs: 45,
    },
    {
      title: 'Palestra: Prevenção de Lesões',
      description: 'Com a equipe de fisioterapia do campus.',
      days: 50,
      hour: '19:00',
      location: 'Anfiteatro Central',
      orgs: [6],
      regs: 30,
    },
  ];
  for (const e of EVENTS) {
    let bracketId: string | undefined;
    if (e.bracket) {
      const res = await m.insert(TournamentBracket, {
        name: `${e.title} - Chave`,
        type: e.bracket.type,
        teamCount: e.bracket.teams,
      });
      bracketId = res.identifiers[0].id as string;
    }
    const date = at(addDays(today, e.days), e.hour);
    const created = addDays(date, -int(20, 40));
    const res = await m.insert(Event, {
      title: e.title,
      description: e.description,
      date,
      location: e.location,
      user: { id: profIds[e.orgs[0]] },
      tournamentBracket: bracketId ? { id: bracketId } : undefined,
      createdAt: created,
    } as never);
    const eventId = res.identifiers[0].id as number;
    await m
      .createQueryBuilder()
      .insert()
      .into('event_organizers')
      .values(e.orgs.map((o) => ({ eventId, userId: profIds[o] })))
      .execute();
    await insertChunks(
      m,
      EventRegistration,
      sample(athletes, e.regs).map((a) => ({
        user: { id: a.id },
        event: { id: eventId },
        active: chance(0.93),
        createdAt: addDays(created, int(1, 15)),
      })),
    );
  }

  // Notificações recentes
  const notifRows: object[] = [];
  for (const a of sample(athletes, 60)) {
    for (let k = int(1, 4); k > 0; k--) {
      const n = pick([
        {
          type: 'training_updated',
          title: 'Treino de Vôlei Feminino foi alterado',
          message: 'Agora: segunda, quarta às 19:30 - Ginásio da FC',
          link: '/agenda',
        },
        {
          type: 'event_created',
          title: 'Novo evento: Copa UNESP de Vôlei',
          message: 'Ginásio da FC - inscrições abertas',
          link: '/agenda',
        },
        {
          type: 'event_created',
          title: 'Novo evento: Festival de Natação',
          message: 'Piscina Semiolímpica - inscrições abertas',
          link: '/agenda',
        },
        {
          type: 'performance_recorded',
          title: 'Desempenho registrado',
          message: 'Seu professor registrou o desempenho do último treino.',
          link: '/dashboard/atleta?tab=desempenho',
        },
        {
          type: 'training_created',
          title: 'Novo treino: Corrida',
          message: 'Sábado às 07:00 - Pista de Atletismo',
          link: '/agenda',
        },
      ]);
      notifRows.push({
        ...n,
        user: { id: a.id },
        read: chance(0.55),
        createdAt: addDays(today, -int(0, 10)),
      });
    }
  }
  await insertChunks(m, Notification, notifRows);

  return {
    professores: profIds.length,
    atletas: athletes.length,
    treinos: trainings.length,
    matriculas: trainings.reduce((s, t) => s + t.members.length, 0),
    presencas: attendanceRows.length,
    desempenho: performanceRows.length,
    atividadesStrava: stravaRows.length,
    avaliacoes: surveyRows.length,
    eventos: EVENTS.length,
    notificacoes: notifRows.length,
    exemplos: {
      professor: `${PROFESSORS[1].name} <${profEmails[1]}>`,
      atletaAssiduo: (() => {
        const a =
          athletes.find(
            (x) => x.profile === 'assiduo' && stravaAthletes.has(x.id),
          ) ?? athletes.find((x) => x.profile === 'assiduo');
        return a ? `${a.name} <${a.email}>` : '';
      })(),
    },
  };
}

async function main() {
  const onlyClear = process.argv.includes('--clear');
  const ds = new DataSource({
    ...dataSourceOptions,
    synchronize: false,
    logging: false,
  });
  await ds.initialize();
  try {
    await ds.transaction(async (m) => {
      const removed = await clear(m);
      console.log(`Seed anterior removido: ${removed} usuários`);
      if (onlyClear) return;
      const summary = await seed(m);
      console.log('Seed criado:', JSON.stringify(summary, null, 2));
      console.log(`Senha de todos os usuários do seed: ${PASSWORD}`);
    });
  } finally {
    await ds.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

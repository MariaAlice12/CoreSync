import {
  INestApplication,
  ValidationPipe,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { getMetadataArgsStorage, DataSource } from 'typeorm';
import { io, Socket } from 'socket.io-client';

// Sobe a API inteira com SQLite em memória no lugar do MySQL.
process.env.UPLOAD_DIR = mkdtempSync(join(tmpdir(), 'coresync-uploads-'));
jest.mock('../src/database/data-source', () => ({
  dataSourceOptions: {
    type: 'sqlite',
    driver: require('sqlite3'),
    database: ':memory:',
    retryAttempts: 0,
    entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
    synchronize: true,
  },
}));
jest.setTimeout(30_000);

import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';

// Tipos do MySQL que o SQLite não conhece (as entidades já foram carregadas
// pelo import do AppModule acima).
for (const col of getMetadataArgsStorage().columns) {
  if (col.options.type === 'timestamp') col.options.type = 'datetime';
  if (col.options.type === 'enum') col.options.type = 'varchar';
}

const WEEKDAYS = [
  'domingo',
  'segunda',
  'terca',
  'quarta',
  'quinta',
  'sexta',
  'sabado',
];
const today = new Date();
const todayISO = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0'),
].join('-');
const todayName = WEEKDAYS[today.getDay()];
const otherDayName = WEEKDAYS[(today.getDay() + 1) % 7];

describe('CoreSync (e2e) — requisitos da especificação', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let baseUrl: string;

  const tokens: Record<string, string> = {};
  const ids: Record<string, number> = {};
  const auth = (who: string) => ({ Authorization: `Bearer ${tokens[who]}` });

  async function signUp(key: string, body: Record<string, unknown>) {
    const res = await http.post('/user').send(body).expect(201);
    ids[key] = res.body.id;
    expect(res.body.password).toBeUndefined();
    const login = await http
      .post('/auth/login')
      .send({ email: body.email, password: body.password })
      .expect(201);
    tokens[key] = login.body.access_token;
  }

  beforeAll(async () => {
    // NestFactory (como no main.ts) em vez de Test.createTestingModule: o
    // ServeStaticModule precisa do adapter HTTP já criado ao instanciar.
    app = await NestFactory.create(AppModule, { logger: ['error'] });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    await app.listen(0);
    baseUrl = await app.getUrl();
    http = request(app.getHttpServer());

    // Admin é criado internamente (cadastro público não permite).
    const admin = await app.get(UserService).create(
      {
        name: 'Admin',
        email: 'admin@x.com',
        password: 'secret1',
        userType: 'admin',
        telephone: '1',
      },
      { id: 0, email: '', userType: 'admin' },
    );
    ids.admin = admin.id;
    tokens.admin = (
      await http
        .post('/auth/login')
        .send({ email: 'admin@x.com', password: 'secret1' })
    ).body.access_token;

    await signUp('prof', {
      name: 'Prof',
      email: 'prof@x.com',
      password: 'secret1',
      userType: 'professor',
      telephone: '2',
    });
    await signUp('ana', {
      name: 'Ana',
      email: 'ana@x.com',
      password: 'secret1',
      userType: 'aluno',
      telephone: '3',
      course: 'Sistemas de Informação',
      shift: 'noite',
      campus: 'Bauru',
    });
    await signUp('bia', {
      name: 'Bia',
      email: 'bia@x.com',
      password: 'secret1',
      userType: 'aluno',
      telephone: '4',
      course: 'Educação Física',
      shift: 'manha',
      campus: 'Bauru',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Cadastro de usuário', () => {
    it('rejeita e-mail duplicado', () =>
      http
        .post('/user')
        .send({
          name: 'X',
          email: 'ana@x.com',
          password: 'secret1',
          userType: 'aluno',
          telephone: '0',
        })
        .expect(409));

    it('não permite criar admin pelo cadastro público', () =>
      http
        .post('/user')
        .send({
          name: 'X',
          email: 'hacker@x.com',
          password: 'secret1',
          userType: 'admin',
          telephone: '0',
        })
        .expect(403));

    it('rejeita turno inválido', () =>
      http
        .post('/user')
        .send({
          name: 'X',
          email: 'y@x.com',
          password: 'secret1',
          userType: 'aluno',
          telephone: '0',
          shift: 'madrugada',
        })
        .expect(400));

    it('filtra usuários por curso e turno', async () => {
      const res = await http
        .get('/user?shift=noite')
        .set(auth('admin'))
        .expect(200);
      expect(res.body.map((u: { name: string }) => u.name)).toEqual(['Ana']);
    });

    it('aluno não altera perfil de outro usuário', () =>
      http
        .patch(`/user/${ids.bia}`)
        .set(auth('ana'))
        .send({ name: 'Z' })
        .expect(403));
  });

  describe('Treinos, notificações em tempo real e matrícula', () => {
    let socket: Socket;
    const received: { type: string }[] = [];

    beforeAll(async () => {
      socket = io(`${baseUrl.replace('[::1]', 'localhost')}/notifications`, {
        auth: { token: tokens.ana },
        transports: ['websocket'],
      });
      socket.on('notification', (n) => received.push(n));
      await new Promise<void>((resolve, reject) => {
        socket.on('connect', () => resolve());
        socket.on('connect_error', reject);
      });
    });

    afterAll(() => socket.disconnect());

    it('aluno não cria treino', () =>
      http
        .post('/training')
        .set(auth('ana'))
        .send({
          modality: 'Vôlei',
          hour: '19:00',
          address: 'Ginásio',
          weekdays: [todayName],
          maxStudents: 2,
          minStudents: 1,
        })
        .expect(403));

    it('professor cria treino por nível e atletas são notificados via WebSocket', async () => {
      const res = await http
        .post('/training')
        .set(auth('prof'))
        .send({
          modality: 'Vôlei',
          hour: '19:00',
          address: 'Ginásio',
          weekdays: [todayName],
          level: 'avancado',
          maxStudents: 1,
          minStudents: 1,
        })
        .expect(201);
      ids.training = res.body.id;
      expect(res.body.level).toBe('avancado');

      await new Promise((r) => setTimeout(r, 200));
      expect(received.map((n) => n.type)).toContain('training_created');

      const mine = await http
        .get('/notification/me')
        .set(auth('bia'))
        .expect(200);
      expect(mine.body.unread).toBe(1);
    });

    it('filtra treinos por nível', async () => {
      const res = await http.get('/training?level=iniciante').expect(200);
      expect(res.body).toHaveLength(0);
    });

    it('matricula o aluno logado, recusa duplicata e respeita vagas', async () => {
      const res = await http
        .post('/enrollment')
        .set(auth('ana'))
        .send({ trainingId: ids.training, userId: ids.bia })
        .expect(201);
      expect(res.body.user.id).toBe(ids.ana); // userId do body é ignorado para aluno
      ids.enrollment = res.body.id;

      await http
        .post('/enrollment')
        .set(auth('ana'))
        .send({ trainingId: ids.training })
        .expect(409);
      await http
        .post('/enrollment')
        .set(auth('bia'))
        .send({ trainingId: ids.training })
        .expect(409); // lotado
    });

    it('aluno vê só as próprias matrículas', async () => {
      const res = await http.get('/enrollment').set(auth('bia')).expect(200);
      expect(res.body).toHaveLength(0);
    });

    it('alterar horário notifica os matriculados', async () => {
      received.length = 0;
      await http
        .patch(`/training/${ids.training}`)
        .set(auth('prof'))
        .send({ hour: '20:00' })
        .expect(200);
      await new Promise((r) => setTimeout(r, 200));
      expect(received.map((n) => n.type)).toEqual(['training_updated']);
    });
  });

  describe('Marcação de presença', () => {
    it('confirma presença no dia do treino', async () => {
      const res = await http
        .post('/attendance')
        .set(auth('ana'))
        .send({ trainingId: ids.training, date: todayISO })
        .expect(201);
      ids.attendance = res.body.id;
    });

    it('recusa presença duplicada', () =>
      http
        .post('/attendance')
        .set(auth('ana'))
        .send({ trainingId: ids.training })
        .expect(409));

    it('recusa aluno não matriculado', () =>
      http
        .post('/attendance')
        .set(auth('bia'))
        .send({ trainingId: ids.training })
        .expect(403));

    it('recusa dia em que não há treino', async () => {
      const t = await http
        .post('/training')
        .set(auth('prof'))
        .send({
          modality: 'Futsal',
          hour: '18:00',
          address: 'Quadra',
          weekdays: [otherDayName],
          maxStudents: 10,
          minStudents: 1,
        })
        .expect(201);
      await http
        .post('/enrollment')
        .set(auth('ana'))
        .send({ trainingId: t.body.id })
        .expect(201);
      await http
        .post('/attendance')
        .set(auth('ana'))
        .send({ trainingId: t.body.id, date: todayISO })
        .expect(400);
    });

    it('professor consulta os confirmados da sessão', async () => {
      const res = await http
        .get(`/attendance/training/${ids.training}?date=${todayISO}`)
        .set(auth('prof'))
        .expect(200);
      expect(res.body).toEqual([
        {
          date: todayISO,
          count: 1,
          attendees: [
            { id: ids.ana, name: 'Ana', attendanceId: ids.attendance },
          ],
        },
      ]);
    });

    it('taxa de presença por sessão', async () => {
      const res = await http
        .get(`/analytics/attendance/${ids.training}`)
        .set(auth('prof'))
        .expect(200);
      const session = res.body.sessions.find(
        (s: { date: string }) => s.date === todayISO,
      );
      expect(session).toEqual({ date: todayISO, present: 1, ratePct: 100 });
    });
  });

  describe('Eventos e repositório de fotos', () => {
    it('aluno não cria evento', () =>
      http
        .post('/event')
        .set(auth('ana'))
        .send({ title: 'X', description: 'Y' })
        .expect(403));

    it('professor cria evento com local e organizadores', async () => {
      const res = await http
        .post('/event')
        .set(auth('prof'))
        .send({
          title: 'Interclasse',
          description: 'Torneio',
          date: `${todayISO}T15:00:00`,
          location: 'Ginásio da FC',
          organizerIds: [ids.prof, ids.admin],
        })
        .expect(201);
      ids.event = res.body.id;
      expect(res.body.location).toBe('Ginásio da FC');
      expect(res.body.user.id).toBe(ids.prof);
      expect(
        res.body.organizers.map((o: { id: number }) => o.id).sort(),
      ).toEqual([ids.admin, ids.prof].sort());
    });

    it('não inscrito não envia foto', () =>
      http
        .post(`/event/${ids.event}/photos`)
        .set(auth('bia'))
        .attach('photos', Buffer.from('fake'), {
          filename: 'a.png',
          contentType: 'image/png',
        })
        .expect(403));

    it('participante envia foto, que fica acessível', async () => {
      await http
        .post('/event-registration')
        .set(auth('ana'))
        .send({ eventId: ids.event })
        .expect(201);
      await http
        .post('/event-registration')
        .set(auth('bia'))
        .send({ eventId: ids.event })
        .expect(201);

      const res = await http
        .post(`/event/${ids.event}/photos`)
        .set(auth('ana'))
        .attach('photos', Buffer.from('fake-png'), {
          filename: 'foto.png',
          contentType: 'image/png',
        })
        .expect(201);
      expect(res.body).toHaveLength(1);

      const list = await http
        .get(`/event/${ids.event}/photos`)
        .set(auth('bia'))
        .expect(200);
      const path = new URL(list.body[0].url).pathname;
      const file = await http.get(path).expect(200);
      expect(file.body.toString()).toBe('fake-png');

      const notes = await http
        .get('/notification/me')
        .set(auth('bia'))
        .expect(200);
      expect(notes.body.items[0].type).toBe('event_photo');
    });

    it('rejeita arquivo que não é imagem', () =>
      http
        .post(`/event/${ids.event}/photos`)
        .set(auth('ana'))
        .attach('photos', Buffer.from('x'), {
          filename: 'a.txt',
          contentType: 'text/plain',
        })
        .expect(400));

    it('excluir evento remove inscrições e fotos', async () => {
      await http.delete(`/event/${ids.event}`).set(auth('prof')).expect(200);
      const regs = await http
        .get(`/event-registration?eventId=${ids.event}`)
        .set(auth('admin'))
        .expect(200);
      expect(regs.body).toHaveLength(0);
    });
  });

  describe('BI e desempenho', () => {
    it('segmenta matrículas por turno e curso', async () => {
      const res = await http
        .get('/analytics/segmentation')
        .set(auth('admin'))
        .expect(200);
      expect(res.body.byShift).toEqual(
        expect.arrayContaining([
          { key: 'noite', enrollments: 2, attendances: 1 },
        ]),
      );
      expect(res.body.byLevel).toEqual(
        expect.arrayContaining([
          { key: 'avancado', enrollments: 1, attendances: 1 },
        ]),
      );
    });

    it('segmentação é restrita a admin', () =>
      http.get('/analytics/segmentation').set(auth('prof')).expect(403));

    it('aluno vê a própria evolução, mas não a de outro', async () => {
      const res = await http
        .get(`/analytics/athlete/${ids.ana}`)
        .set(auth('ana'))
        .expect(200);
      expect(res.body.totals.attendances).toBe(1);
      await http
        .get(`/analytics/athlete/${ids.ana}`)
        .set(auth('bia'))
        .expect(403);
    });

    it('Strava sem credenciais configuradas responde 400 ao conectar', () =>
      http.get('/strava/connect').set(auth('ana')).expect(400));

    it('Strava status indica desconectado', async () => {
      const res = await http.get('/strava/status').set(auth('ana')).expect(200);
      expect(res.body.connected).toBe(false);
    });
  });

  it('banco em memória foi usado', () => {
    expect(app.get(DataSource).options.type).toBe('sqlite');
  });
});

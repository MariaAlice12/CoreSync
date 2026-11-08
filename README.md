<h1 align="center">CoreSync</h1>

<p align="center">
  <strong>PT:</strong> API REST para gerenciamento de modalidades esportivas — treinos, eventos, matrículas e integração com Strava.<br/>
  <strong>EN:</strong> REST API for sports management — training sessions, events, enrollments and Strava integration.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/TypeORM-0.3-FE0902?logo=typeorm&logoColor=white" alt="TypeORM"/>
  <img src="https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white" alt="JWT"/>
  <img src="https://img.shields.io/badge/Swagger-Docs-85EA2D?logo=swagger&logoColor=black" alt="Swagger"/>
</p>

---

## Sobre o Projeto / About

**PT:** O CoreSync é o backend de um Trabalho de Conclusão de Curso (TCC — Bacharelado em Sistemas de Informação, UNESP Bauru). A API centraliza a gestão das atividades esportivas de uma atlética (ou de qualquer organização esportiva): cadastro de administradores, professores e atletas (com curso, turno e campus), treinos por nível de maturidade, matrículas, **marcação de presença**, eventos com local, organizadores e **repositório de fotos em nuvem**, **notificações em tempo real** (WebSocket, com fallback por e-mail), **registro de desempenho por sessão** pelo professor, **integração OAuth com o Strava** por atleta (distância, tempo, ritmo e frequência cardíaca, vinculados automaticamente às presenças) e **BI segmentado** por modalidade, curso, turno, nível e campus.

O frontend React fica no repositório [CoreSyncWeb](https://github.com/MariaAlice12/CoreSyncWeb).

**EN:** CoreSync is the backend of a final undergraduate project (TCC). The API provides full features for gyms and sports clubs: user registration, training management, enrollments, events with tournament brackets and physical activity sync via Strava.

---

## Tecnologias / Tech Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| NestJS | ^10 | Framework principal |
| TypeORM | ^0.3 | ORM para banco de dados |
| MySQL | 8 | Banco de dados relacional |
| Passport + JWT | — | Autenticação |
| Swagger / OpenAPI | ^7 | Documentação interativa da API |
| bcryptjs | ^3 | Hash de senhas |
| Axios | ^1 | Integração com API do Strava |
| class-validator | ^0.14 | Validação de DTOs |
| Socket.IO (`@nestjs/websockets`) | ^10 | Notificações em tempo real |
| AWS SDK S3 | ^3 | Repositório de fotos dos eventos |
| `@nestjs/throttler` | ^6 | Limite de tentativas de login |
| Nodemailer | ^10 | Fallback das notificações por e-mail (SMTP) |
| Helmet | ^8 | Cabeçalhos HTTP de segurança |

---

## Módulos / Modules

| Módulo | Rota base | Responsabilidade |
|---|---|---|
| Auth | `/auth` | Login e emissão de JWT |
| User | `/user` | Usuários (aluno / professor / admin) com curso, turno e campus |
| Training | `/training` | Treinos (modalidade, nível, horário, local, campus) |
| Enrollment | `/enrollment` | Matrículas (usuário + treino), com controle de vagas |
| Attendance | `/attendance` | Marcação de presença por sessão de treino (com a atividade do Strava do dia) |
| Performance | `/performance` | Registro de desempenho do atleta por sessão (nota, observações, métricas) |
| Event | `/event` | Eventos esportivos + repositório de fotos |
| Event Registration | `/event-registration` | Inscrições (participantes) em eventos |
| Tournament Bracket | `/tournament-bracket` | Chaves de torneio |
| Notification | `/notification` + WebSocket `/notifications` | Notificações automáticas em tempo real |
| Strava | `/strava` | OAuth por atleta, sincronização e listagem de atividades |
| Survey | `/survey` | Avaliação dos treinos pelos alunos |
| Analytics | `/analytics` | Dashboards de ocupação, presença, desempenho e BI segmentado |

---

## Pré-requisitos / Prerequisites

- Node.js 20+
- MySQL 8+
- npm ou yarn

---

## Instalação / Installation

```bash
# 1. Clone o repositório / Clone the repository
git clone https://github.com/MariaAlice12/CoreSync.git
cd CoreSync

# 2. Copie o arquivo de variáveis de ambiente / Copy the env file
cp .env.example .env
# Edite o .env com suas credenciais / Edit .env with your credentials

# 3. Instale as dependências / Install dependencies
npm install

# 4. Crie o banco de dados no MySQL / Create the database in MySQL
mysql -u root -p -e "CREATE DATABASE coresync;"
# Crie as tabelas com as migrations / Create the tables with migrations
npm run migration:run

# 5. Inicie em modo de desenvolvimento / Start in development mode
npm run start:dev
```

> A API estará disponível em / API will be available at: `http://localhost:8080`  
> Documentação Swagger / Swagger Docs: `http://localhost:8080/api`

---

## Deploy do banco com Docker Compose / Database deploy

O schema é versionado com **migrations do TypeORM** (`src/database/migrations`). O `docker-compose.yml` sobe tudo em ordem:

1. `db` — MySQL 8, com healthcheck e volume `db_data`
2. `migrate` — roda `migration:run` e encerra
3. `api` — só sobe se as migrations terminarem com sucesso

```bash
cp .env.example .env            # preencha DB_PASSWORD, DB_ROOT_PASSWORD e JWT_SECRET
./scripts/db-deploy.sh          # build -> MySQL -> backup (mysqldump) -> migrations -> API
# ou, sem backup:
docker compose up -d --build
```

Os backups ficam em `backups/` (fora do git).

### Migrations

```bash
npm run migration:generate -- src/database/migrations/NomeDaMudanca  # gera a partir das entidades
npm run migration:run                                                 # aplica as pendentes
npm run migration:revert                                              # desfaz a última
npm run migration:show                                                # lista o status
```

Para gerar, rode contra um banco com o schema atual (por exemplo, `docker compose up -d db`, com `DB_HOST=localhost` no `.env`).

---

## Variáveis de Ambiente / Environment Variables

Copie `.env.example` para `.env` e preencha os valores:

| Variável | Padrão | Descrição |
|---|---|---|
| `DB_HOST` | `localhost` | Host do banco MySQL |
| `DB_PORT` | `3306` | Porta do MySQL |
| `DB_DATABASE` | `coresync` | Nome do banco de dados |
| `DB_USERNAME` | `root` | Usuário do MySQL |
| `DB_PASSWORD` | `root` | Senha do MySQL |
| `DB_ROOT_PASSWORD` | — | Senha do root do MySQL (apenas docker compose) |
| `DB_SYNCHRONIZE` | `false` | `true` recria o schema a partir das entidades (só em dev) |
| `JWT_SECRET` | — | Chave secreta para assinar os tokens JWT |
| `PORT` | `8080` | Porta em que o servidor sobe |
| `FRONTEND_URL` | `http://localhost:5173` | URL(s) do frontend para CORS e redirecionamento do Strava |
| `API_PUBLIC_URL` | `http://localhost:8080` | URL pública da API (links das fotos locais e callback do Strava) |
| `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET` | — | Credenciais do app Strava ([criar aqui](https://www.strava.com/settings/api)) |
| `STRAVA_REDIRECT_URI` | `${API_PUBLIC_URL}/strava/callback` | Callback OAuth do Strava |
| `AWS_S3_BUCKET` | — | Bucket S3 das fotos. **Sem ele, as fotos ficam em disco** (`UPLOAD_DIR`) e são servidas em `/uploads` |
| `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | — | Credenciais AWS |
| `AWS_S3_PUBLIC_URL` | `https://<bucket>.s3.<region>.amazonaws.com` | URL pública/CDN do bucket |
| `UPLOAD_DIR` | `./uploads` | Pasta das fotos quando o S3 não está configurado |
| `TZ` | — | Fuso do servidor (recomendado `America/Sao_Paulo`): define a data local usada para casar atividades do Strava com as sessões |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | — / `587` / `false` | Servidor SMTP. **Sem `SMTP_HOST`, o e-mail fica desligado** |
| `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | — | Credenciais e remetente dos e-mails |

> Para múltiplas origens no CORS, separe por vírgula: `http://localhost:5173,http://localhost:5174`

---

## Endpoints da API / API Endpoints

> 🔒 = requer autenticação Bearer JWT  
> Envie o token no header: `Authorization: Bearer <token>`

### Auth

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/login` | Login — retorna JWT e dados do usuário |

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

---

### Usuários / Users

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/user` | Criar usuário (admin só por outro admin) | — |
| `GET` | `/user?userType=&course=&shift=&campus=` | Listar usuários com filtros | 🔒 |
| `GET` | `/user/:id` | Buscar usuário por ID | 🔒 |
| `PATCH` | `/user/:id` | Atualizar (o próprio perfil, ou qualquer um se admin) | 🔒 |
| `DELETE` | `/user/:id` | Remover usuário | 🔒 admin |

```json
{
  "name": "Maria Alice",
  "email": "maria@email.com",
  "password": "senha123",
  "userType": "aluno",
  "telephone": "11999999999",
  "course": "Sistemas de Informação",
  "shift": "noite",
  "campus": "Bauru"
}
```

> `userType`: `aluno` | `professor` | `admin` — `shift`: `manha` | `tarde` | `noite` | `integral`

---

### Treinos / Training

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/training` | Criar treino (professor ou admin) | 🔒 |
| `GET` | `/training?modality=&level=&professorId=&campus=&active=` | Listar treinos com filtros | — |
| `GET` | `/training/:id` | Buscar treino por ID | — |
| `PATCH` | `/training/:id` | Atualizar (professor responsável ou admin) | 🔒 |
| `DELETE` | `/training/:id` | Remover (professor responsável ou admin) | 🔒 |

```json
{
  "modality": "Vôlei",
  "hour": "19:00",
  "address": "Ginásio da FC",
  "weekdays": ["segunda", "quarta"],
  "level": "intermediario",
  "campus": "Bauru",
  "description": "Treino do time feminino",
  "maxStudents": 15,
  "minStudents": 8,
  "professorId": 2
}
```

> `level`: `iniciante` | `intermediario` | `avancado`. `professorId` é obrigatório quando quem cria é admin.
> Criar um treino notifica todos os atletas; alterar horário, local, dias ou status notifica os matriculados.

---

### Matrículas / Enrollment

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/enrollment` | Matricular (aluno: sempre ele mesmo) — 409 se duplicada ou treino lotado | 🔒 |
| `GET` | `/enrollment?trainingId=&course=&shift=&active=` | Listar (aluno vê só as suas) | 🔒 |
| `GET` | `/enrollment/me` | Matrículas do usuário logado | 🔒 |
| `GET` | `/enrollment/:id` | Buscar matrícula | 🔒 |
| `PATCH` | `/enrollment/:id` | Ativar/cancelar (`{ "active": false }`) | 🔒 |
| `DELETE` | `/enrollment/:id` | Remover | 🔒 |

---

### Presença / Attendance

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/attendance` | Confirmar presença (`{ "trainingId": 1, "date": "2026-03-16" }`, data padrão = hoje) | 🔒 |
| `GET` | `/attendance/me` | Presenças do usuário logado | 🔒 |
| `GET` | `/attendance/training/:id?date=&from=` | Sessões com a lista de confirmados (professor, admin e matriculados) | 🔒 |
| `DELETE` | `/attendance/:id` | Cancelar presença | 🔒 |

> Regras: o atleta precisa estar matriculado, a data não pode ser passada e precisa cair em um dos dias do treino; presença duplicada retorna 409.
> Cada confirmado em `/attendance/training/:id` traz `activity` (atividade do Strava iniciada no mesmo dia, a mais próxima do horário do treino: distância, tempo, ritmo e FC) e `performance` (registro do professor), ou `null`.

---

### Desempenho / Performance

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `PUT` | `/performance/attendance/:attendanceId` | Registrar ou atualizar o desempenho do atleta na sessão (professor do treino ou admin; só sessões de hoje ou passadas) — notifica o atleta | 🔒 |
| `GET` | `/performance/me` | Desempenho registrado do usuário logado | 🔒 |
| `GET` | `/performance/training/:id?from=` | Registros de um treino | 🔒 professor/admin |
| `DELETE` | `/performance/:id` | Remover registro | 🔒 professor/admin |

```json
{
  "rating": 4,
  "notes": "Boa evolução na recepção",
  "metrics": [{ "name": "Saques certos", "value": 12, "unit": "un" }]
}
```

> `rating` de 1 a 5; até 10 métricas livres. Serve para modalidades sem GPS (vôlei, futsal...), complementando o Strava.

---

### Eventos / Events

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/event` | Criar evento (professor ou admin) — notifica os atletas | 🔒 |
| `GET` | `/event` | Listar eventos | — |
| `GET` | `/event/:id` | Buscar evento | — |
| `PATCH` | `/event/:id` | Atualizar (criador, organizador ou admin) — mudança de data/local notifica inscritos | 🔒 |
| `DELETE` | `/event/:id` | Remover (criador, organizador ou admin) | 🔒 |
| `GET` | `/event/:id/photos` | Listar fotos do repositório | 🔒 |
| `POST` | `/event/:id/photos` | Enviar fotos (`multipart/form-data`, campo `photos`, até 10 imagens de 10 MB) — participantes e organizadores | 🔒 |
| `DELETE` | `/event/:id/photos/:photoId` | Remover foto (autor, organizador ou admin) | 🔒 |

```json
{
  "title": "Interclasse 2026",
  "description": "Torneio entre cursos",
  "date": "2026-05-10T14:00:00",
  "location": "Ginásio da FC",
  "organizerIds": [2, 5],
  "bracketType": "single",
  "teamCount": 8
}
```

---

### Inscrições em Eventos / Event Registration

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/event-registration` | Inscrever-se (`{ "eventId": 1 }`) | 🔒 |
| `GET` | `/event-registration?eventId=` | Participantes | 🔒 |
| `GET` | `/event-registration/me` | Inscrições do usuário logado | 🔒 |
| `GET` | `/event-registration/:id` | Buscar inscrição | 🔒 |
| `PATCH` | `/event-registration/:id` | Ativar/cancelar | 🔒 |
| `DELETE` | `/event-registration/:id` | Remover | 🔒 |

---

### Chaves de Torneio / Tournament Bracket

> O ID desta entidade é um **UUID** (string), não um inteiro.

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/tournament-bracket` | Criar chave | 🔒 admin/professor |
| `GET` | `/tournament-bracket` | Listar chaves | — |
| `GET` | `/tournament-bracket/:uuid` | Buscar chave | — |
| `PATCH` | `/tournament-bracket/:uuid` | Atualizar chave | 🔒 admin/professor |
| `DELETE` | `/tournament-bracket/:uuid` | Remover chave | 🔒 admin/professor |

> `type` aceita: `single` | `double` | `round-robin`

---

### Notificações / Notifications

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/notification/me` | Últimas 50 notificações + contador de não lidas | 🔒 |
| `PATCH` | `/notification/:id/read` | Marcar como lida | 🔒 |
| `PATCH` | `/notification/read-all` | Marcar todas como lidas | 🔒 |

**Tempo real:** conecte via Socket.IO no namespace `/notifications` enviando o JWT:

```js
import { io } from 'socket.io-client'
const socket = io('http://localhost:8080/notifications', { auth: { token } })
socket.on('notification', (n) => console.log(n.title, n.message))
```

**Fallback por e-mail:** notificações críticas (treino com horário, local, dias ou status alterado; evento com data ou local alterado) também são enviadas por e-mail quando `SMTP_HOST` está configurado. O envio não bloqueia a requisição e falhas apenas geram log.

---

### Strava

Cada atleta conecta a **própria** conta Strava via OAuth.

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/strava/connect` | Retorna `{ url }` de autorização do Strava | 🔒 |
| `GET` | `/strava/callback` | Callback OAuth (redireciona para `FRONTEND_URL/perfil?strava=connected`) | — |
| `GET` | `/strava/status` | Situação da conexão | 🔒 |
| `GET` | `/strava/sync?perPage=N` | Importa as últimas N atividades (padrão 30) | 🔒 |
| `GET` | `/strava` | Atividades do usuário logado (com `pace` em s/km) | 🔒 |
| `GET` | `/strava/user/:id` | Atividades de um atleta | 🔒 admin/professor |
| `DELETE` | `/strava/disconnect` | Revoga o acesso e desconecta | 🔒 |

---

### Analytics / BI

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/analytics/admin-overview` | Ocupação, evasão e avaliação dos treinos | 🔒 admin |
| `GET` | `/analytics/professor-performance?professorId=` | Desempenho dos treinos de um professor | 🔒 admin/professor |
| `GET` | `/analytics/segmentation?modality=&level=&course=&shift=&campus=` | Matrículas e presenças (30 dias) por modalidade, nível, curso, turno e campus | 🔒 admin |
| `GET` | `/analytics/attendance/:trainingId?weeks=8` | Taxa de presença por sessão | 🔒 admin/professor |
| `GET` | `/analytics/athlete/:id` | Evolução do atleta: presenças e nota média por semana, sessões (Strava + desempenho) e métricas do Strava | 🔒 |

---

## Modelos de Dados / Data Models

### User

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `number` | PK auto-incremental |
| `name` | `string` | Nome completo |
| `email` | `string` | E-mail único |
| `password` | `string` | Hash bcrypt — **nunca retornado nas respostas** |
| `userType` | `enum` | `aluno` \| `professor` \| `admin` |
| `telephone` | `string` | Telefone de contato |
| `course` | `string?` | Curso |
| `shift` | `string?` | Turno: `manha` \| `tarde` \| `noite` \| `integral` |
| `campus` | `string?` | Campus / unidade |
| `createdAt` | `Date` | Data de criação |
| `updatedAt` | `Date` | Data de atualização |

### Training

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `number` | PK auto-incremental |
| `modality` | `string` | Modalidade esportiva |
| `hour` | `string` | Horário do treino |
| `address` | `string` | Local do treino |
| `weekdays` | `string[]` | Dias da semana |
| `description` | `string?` | Descrição opcional |
| `active` | `boolean` | Treino ativo (padrão: `true`) |
| `level` | `string` | `iniciante` \| `intermediario` \| `avancado` |
| `campus` | `string?` | Campus / unidade |
| `professor` | `User?` | Professor responsável |
| `maxStudents` | `number` | Máximo de alunos |
| `minStudents` | `number` | Mínimo de alunos |

### Enrollment

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `number` | PK auto-incremental |
| `user` | `User` | Aluno matriculado |
| `training` | `Training` | Treino vinculado |
| `date` | `Date` | Data da matrícula |
| `active` | `boolean` | Matrícula ativa |

### Event

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `number` | PK auto-incremental |
| `user` | `User` | Usuário criador |
| `title` | `string` | Título do evento |
| `description` | `string` | Descrição |
| `image` | `string?` | URL da imagem |
| `date` | `Date?` | Data e horário do evento |
| `location` | `string?` | Local |
| `organizers` | `User[]` | Organizadores |
| `photos` | `EventPhoto[]` | Repositório de fotos (`url`, `uploadedBy`) |
| `tournamentBracket` | `TournamentBracket?` | Chave de torneio associada |

### Attendance

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `number` | PK auto-incremental |
| `user` | `User` | Atleta |
| `training` | `Training` | Treino |
| `date` | `string` | Dia da sessão (`YYYY-MM-DD`), único por atleta + treino |

### PerformanceRecord

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `number` | PK auto-incremental |
| `attendance` | `Attendance` | Presença (sessão) avaliada — único |
| `rating` | `number?` | Nota de 1 a 5 |
| `notes` | `string?` | Observações do professor |
| `metrics` | `{ name, value, unit? }[]` | Métricas livres (JSON) |
| `recordedBy` | `User?` | Quem registrou |

### Notification

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `number` | PK auto-incremental |
| `user` | `User` | Destinatário |
| `type` | `string` | `training_created` \| `training_updated` \| `event_created` \| `event_updated` \| `event_photo` \| `performance_recorded` |
| `title` / `message` | `string` | Conteúdo |
| `link` | `string?` | Rota do frontend relacionada |
| `read` | `boolean` | Lida |

### EventRegistration

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `number` | PK auto-incremental |
| `user` | `User` | Usuário inscrito |
| `event` | `Event` | Evento vinculado |

### TournamentBracket

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string (UUID)` | PK UUID |
| `name` | `string` | Nome do torneio |
| `type` | `enum` | `single` \| `double` \| `round-robin` |
| `teamCount` | `number` | Número de equipes (mínimo 2) |

### Strava

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `number` | PK auto-incremental |
| `stravaId` | `string` | ID único da atividade no Strava |
| `name` | `string` | Nome da atividade |
| `distance` | `float` | Distância (metros) |
| `movingTime` | `int` | Tempo em movimento (segundos) |
| `elapsedTime` | `int` | Tempo total decorrido (segundos) |
| `totalElevationGain` | `float` | Ganho de elevação (metros) |
| `type` | `string` | Tipo da atividade |
| `sportType` | `string?` | Subtipo esportivo |
| `averageSpeed` | `float?` | Velocidade média (m/s) |
| `maxSpeed` | `float?` | Velocidade máxima (m/s) |
| `averageHeartrate` / `maxHeartrate` | `float?` | Frequência cardíaca (bpm) |
| `averageCadence` | `float?` | Cadência média |
| `user` | `User` | Atleta dono da atividade |
| `startDate` | `Date` | Data/hora de início |

---

## Documentação Swagger / Swagger Docs

Com o servidor rodando, acesse a documentação interativa em:

```
http://localhost:8080/api
```

Todas as rotas, parâmetros e respostas estão documentados via Swagger/OpenAPI. Rotas protegidas exigem que você clique em **Authorize** e informe o token JWT.

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run start` | Inicia o servidor em modo produção compilado |
| `npm run start:dev` | Inicia em modo de desenvolvimento (hot-reload) |
| `npm run start:debug` | Inicia com debugger ativo |
| `npm run start:prod` | Executa o build compilado (`dist/main`) |
| `npm run build` | Compila o projeto TypeScript |
| `npm run test` | Roda os testes unitários |
| `npm run test:e2e` | Roda os testes end-to-end (API completa com SQLite em memória — não precisa de MySQL) |
| `npm run test:cov` | Gera relatório de cobertura de testes |
| `npm run lint` | Analisa e corrige erros de lint |
| `npm run format` | Formata o código com Prettier |

---

## Licença / License

Software livre sob a licença **MIT** — veja [LICENSE](LICENSE). Contribuições são bem-vindas.  
Open source under the **MIT** license — see [LICENSE](LICENSE). Contributions are welcome.

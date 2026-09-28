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

**PT:** O CoreSync é o backend de um Trabalho de Conclusão de Curso (TCC). A API oferece recursos completos para academias e clubes esportivos: cadastro de alunos e professores, gerenciamento de treinos, matrículas, eventos com chaves de torneio e sincronização de atividades físicas via Strava.

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

---

## Módulos / Modules

| Módulo | Rota base | Responsabilidade |
|---|---|---|
| Auth | `/auth` | Login e emissão de JWT |
| User | `/user` | CRUD de usuários (aluno / professor / admin) |
| Training | `/training` | CRUD de treinos (modalidade, horário, local) |
| Enrollment | `/enrollment` | CRUD de matrículas (usuário + treino) |
| Event | `/event` | CRUD de eventos esportivos |
| Event Registration | `/event-registration` | CRUD de inscrições em eventos |
| Tournament Bracket | `/tournament-bracket` | CRUD de chaves de torneio |
| Strava | `/strava` | Sincronização e listagem de atividades do Strava |

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
| `FRONTEND_URL` | `http://localhost:5173` | URL(s) do frontend para configuração do CORS |

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
| `POST` | `/user` | Criar usuário | — |
| `GET` | `/user` | Listar todos os usuários | 🔒 |
| `GET` | `/user/:id` | Buscar usuário por ID | 🔒 |
| `PATCH` | `/user/:id` | Atualizar usuário | 🔒 |
| `DELETE` | `/user/:id` | Remover usuário | 🔒 |

**Body (POST/PATCH):**
```json
{
  "name": "Maria Alice",
  "email": "maria@email.com",
  "password": "senha123",
  "userType": "aluno",
  "telephone": "11999999999"
}
```

> `userType` aceita: `aluno` | `professor` | `admin`

---

### Treinos / Training

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/training` | Criar treino | 🔒 |
| `GET` | `/training` | Listar todos os treinos | — |
| `GET` | `/training/:id` | Buscar treino por ID | — |
| `PATCH` | `/training/:id` | Atualizar treino | 🔒 |
| `DELETE` | `/training/:id` | Remover treino | 🔒 |

**Body (POST/PATCH):**
```json
{
  "modality": "Natação",
  "hour": "07:00",
  "address": "Rua das Piscinas, 100",
  "weekdays": ["segunda", "quarta", "sexta"],
  "description": "Treino para iniciantes",
  "active": true,
  "maxStudents": 20,
  "minStudents": 5
}
```

---

### Matrículas / Enrollment

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/enrollment` | Criar matrícula | 🔒 |
| `GET` | `/enrollment` | Listar todas as matrículas | — |
| `GET` | `/enrollment/:id` | Buscar matrícula por ID | — |
| `PATCH` | `/enrollment/:id` | Atualizar matrícula | 🔒 |
| `DELETE` | `/enrollment/:id` | Remover matrícula | 🔒 |

---

### Eventos / Events

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/event` | Criar evento | 🔒 |
| `GET` | `/event` | Listar todos os eventos | — |
| `GET` | `/event/:id` | Buscar evento por ID | — |
| `PATCH` | `/event/:id` | Atualizar evento | 🔒 |
| `DELETE` | `/event/:id` | Remover evento | 🔒 |

---

### Inscrições em Eventos / Event Registration

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/event-registration` | Criar inscrição em evento | 🔒 |
| `GET` | `/event-registration` | Listar todas as inscrições | — |
| `GET` | `/event-registration/:id` | Buscar inscrição por ID | — |
| `PATCH` | `/event-registration/:id` | Atualizar inscrição | 🔒 |
| `DELETE` | `/event-registration/:id` | Remover inscrição | 🔒 |

---

### Chaves de Torneio / Tournament Bracket

> O ID desta entidade é um **UUID** (string), não um inteiro.

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/tournament-bracket` | Criar chave de torneio | — |
| `GET` | `/tournament-bracket` | Listar todas as chaves | — |
| `GET` | `/tournament-bracket/:uuid` | Buscar chave por UUID | — |
| `PATCH` | `/tournament-bracket/:uuid` | Atualizar chave | — |
| `DELETE` | `/tournament-bracket/:uuid` | Remover chave | — |

**Body (POST/PATCH):**
```json
{
  "name": "Campeonato Interno 2025",
  "type": "single",
  "teamCount": 8
}
```

> `type` aceita: `single` | `double` | `round-robin`

---

### Strava

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/strava` | Listar atividades salvas no banco | — |
| `GET` | `/strava/sync?perPage=N` | Sincronizar atividades da API do Strava | — |

> `perPage` é opcional; padrão = 5

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
| `date` | `Date?` | Data do evento |
| `tournamentBracket` | `TournamentBracket?` | Chave de torneio associada |

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
| `npm run test:e2e` | Roda os testes end-to-end |
| `npm run test:cov` | Gera relatório de cobertura de testes |
| `npm run lint` | Analisa e corrige erros de lint |
| `npm run format` | Formata o código com Prettier |

---

## Licença / License

Projeto acadêmico — licença **UNLICENSED**.  
Academic project — **UNLICENSED**.

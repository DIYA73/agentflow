<div align="center">

# ⚡ agentflow

**Visual AI Agent Builder & Orchestration Platform**

*Build multi-agent pipelines visually. Watch them execute in real time.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React Flow](https://img.shields.io/badge/React_Flow-11-FF0072?style=flat-square)](https://reactflow.dev/)
[![Redis](https://img.shields.io/badge/Redis-BullMQ-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-TypeORM-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](https://opensource.org/licenses/MIT)

[Live Demo](https://agentflow.vercel.app) · [API Docs](http://localhost:3001/api) · [Report Bug](https://github.com/DIYA73/agentflow/issues)

![agentflow demo](https://raw.githubusercontent.com/DIYA73/agentflow/main/docs/demo.png)

</div>

---

## what is this?

agentflow is a self-hostable platform for building and running multi-agent AI pipelines visually. drag nodes onto a canvas, connect them, and hit run — each node executes in sequence, passes data downstream, and you watch everything happen live.

no boilerplate. no LangChain spaghetti. just nodes and edges.

---

## features
🎨  Visual Canvas        drag-and-drop agent builder powered by React Flow
🤖  8 Agent Types        LLM · scraper · API · code · email · transform · webhook · condition
⚡  Live Execution       nodes light up yellow → green/red as they run
📡  Real-time Logs       WebSocket streams every log line to the UI instantly
🔁  BullMQ Queue         async processing, retry logic, exponential backoff
⏰  Triggers             cron schedules + webhook endpoints
🏢  Multi-tenant         full workspace isolation per team
📜  Flow Versioning      every save is a version — one-click rollback
🐳  Self-hostable        Docker Compose, runs anywhere
---

## stack

| layer | tech |
|-------|------|
| frontend | Next.js 14 · TypeScript · Tailwind CSS · React Flow · shadcn/ui |
| backend | NestJS · TypeScript · Socket.io · BullMQ |
| database | PostgreSQL · TypeORM |
| queue | Redis · BullMQ |
| ai | OpenAI GPT-4o |
| auth | JWT · Refresh Tokens |
| infra | Docker · GitHub Actions |

---

## quick start

```bash
# clone
git clone https://github.com/DIYA73/agentflow.git
cd agentflow

# configure
cp .env.example .env
# edit .env with your values

# start infrastructure
docker compose up -d

# run (two terminals)
cd apps/api && npm run start:dev
cd apps/web && npm run dev
```

→ open [http://localhost:3000](http://localhost:3000)

---

## agent nodes

| node | description |
|------|-------------|
| `ai-llm` | send prompt to GPT-4o, receive structured response |
| `web-scraper` | fetch any URL, extract text and HTML |
| `api-caller` | HTTP GET/POST/PUT/DELETE to any endpoint |
| `code-runner` | execute sandboxed JavaScript snippets |
| `email-sender` | send transactional email via Resend |
| `data-transform` | pick, omit, merge, or map JSON data |
| `webhook-output` | POST execution results to external URL |
| `condition` | if/else branching based on data values |

---

## how execution works
User clicks Run
│
▼
FlowsService.execute()
│
▼
ExecutionsService.enqueue()  ──→  BullMQ Queue (Redis)
│
▼
ExecutionProcessor.handleRunFlow()
│
├─ topological sort (Kahn's algorithm)
├─ for each node:
│    ├─ emit node:status → running  ──→  WebSocket → UI (yellow)
│    ├─ NodesService.execute()
│    └─ emit node:status → success  ──→  WebSocket → UI (green)
│
└─ emit execution:status → SUCCESS

---

## environment variables

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/agentflow

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-...

# Email (optional)
RESEND_API_KEY=re_...

# App
PORT=3001
NODE_ENV=development
WEB_URL=http://localhost:3000
```

---

## project structure
agentflow/
├── apps/
│   ├── api/                    # NestJS backend
│   │   └── src/
│   │       ├── auth/           # JWT authentication
│   │       ├── executions/     # BullMQ execution engine
│   │       ├── flows/          # flow CRUD + versioning
│   │       ├── gateway/        # WebSocket gateway
│   │       ├── nodes/          # 8 built-in node executors
│   │       ├── triggers/       # cron + webhook triggers
│   │       └── workspaces/     # multi-tenant isolation
│   └── web/                    # Next.js frontend
│       └── src/
│           ├── app/            # App Router pages
│           ├── components/
│           │   ├── canvas/     # React Flow canvas
│           │   └── nodes/      # custom node renderers
│           └── lib/
│               └── hooks/      # useExecutionSocket
└── packages/
└── shared/                 # shared TypeScript types
---

## roadmap

- [x] visual drag-and-drop canvas
- [x] 8 built-in agent node types
- [x] real-time execution via WebSocket
- [x] live node status (yellow → green/red)
- [x] BullMQ async queue with retry
- [x] multi-tenant workspaces
- [x] flow versioning + rollback
- [x] cron + webhook triggers
- [ ] custom node SDK
- [ ] flow marketplace
- [ ] human-in-the-loop approval nodes
- [ ] Python SDK

---

<div align="center">

MIT © [DIYA73](https://github.com/DIYA73) · built with ❤️

*SaaS & Microservices Engineer · Web to IoT systems*

</div>

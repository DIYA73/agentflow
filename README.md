# agentflow

**Visual AI Agent Builder & Orchestration Platform**

> Build multi-agent pipelines visually. Watch them execute in real time.

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-BullMQ-DC382D?style=flat-square&logo=redis&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)

---

## what is this?

agentflow is a self-hostable platform for building and running multi-agent AI pipelines visually. drag nodes onto a canvas, connect them, hit run — watch everything execute live.

no boilerplate. no LangChain spaghetti. just nodes and edges.

---

## features

- Visual Canvas — drag-and-drop builder powered by React Flow
- 8 Agent Types — LLM, scraper, API, code, email, transform, webhook, condition
- Live Execution — nodes light up yellow to green/red as they run
- Real-time Logs — WebSocket streams every log line to the UI instantly
- BullMQ Queue — async processing, retry logic, exponential backoff
- Triggers — cron schedules and webhook endpoints
- Multi-tenant — full workspace isolation per team
- Flow Versioning — every save is a version, one-click rollback
- Self-hostable — Docker Compose, runs anywhere

---

## stack

| layer | tech |
|-------|------|
| frontend | Next.js 14, TypeScript, Tailwind CSS, React Flow, shadcn/ui |
| backend | NestJS, TypeScript, Socket.io, BullMQ |
| database | PostgreSQL, TypeORM |
| queue | Redis, BullMQ |
| ai | OpenAI GPT-4o |
| auth | JWT, Refresh Tokens |
| infra | Docker, GitHub Actions |

---

## quick start

Clone the repo and configure your environment:

    git clone https://github.com/DIYA73/agentflow.git
    cd agentflow
    cp .env.example .env
    docker compose up -d
    cd apps/api && npm run start:dev
    cd apps/web && npm run dev

Open http://localhost:3000

---

## agent nodes

| node | description |
|------|-------------|
| ai-llm | send prompt to GPT-4o, receive structured response |
| web-scraper | fetch any URL, extract text and HTML |
| api-caller | HTTP GET/POST/PUT/DELETE to any endpoint |
| code-runner | execute sandboxed JavaScript snippets |
| email-sender | send transactional email via Resend |
| data-transform | pick, omit, merge, or map JSON data |
| webhook-output | POST execution results to external URL |
| condition | if/else branching based on data values |

---

## environment variables

    DATABASE_URL=postgresql://postgres:password@localhost:5432/agentflow
    REDIS_URL=redis://localhost:6379
    JWT_SECRET=your-super-secret-key
    JWT_EXPIRES_IN=15m
    OPENAI_API_KEY=sk-...
    PORT=3001
    NODE_ENV=development
    WEB_URL=http://localhost:3000

---

## roadmap

- [x] visual drag-and-drop canvas
- [x] 8 built-in agent node types
- [x] real-time execution via WebSocket
- [x] live node status (yellow to green/red)
- [x] BullMQ async queue with retry
- [x] multi-tenant workspaces
- [x] flow versioning + rollback
- [x] cron + webhook triggers
- [ ] custom node SDK
- [ ] flow marketplace
- [ ] human-in-the-loop approval nodes

---

MIT - DIYA73 

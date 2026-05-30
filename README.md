# agentflow

> Visual AI Agent Builder & Orchestration Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Build, chain, and deploy autonomous AI agents visually — no code required. Each node is a specialized agent; edges define how data flows between them.

---

## what it does

agentflow lets you design multi-agent pipelines on a drag-and-drop canvas. you connect nodes, hit run, and watch them execute in real time — nodes light up as they process, logs stream live, and results flow downstream automatically.

---

## features

- **visual canvas** — drag-and-drop builder powered by React Flow
- **8 built-in agent types** — LLM, web scraper, API caller, code runner, email sender, data transformer, webhook output, condition branching
- **live execution** — nodes light up yellow → green/red as they run via WebSocket
- **real-time logs** — execution logs stream live to the UI
- **BullMQ queue** — async job processing with Redis, retry logic, exponential backoff
- **multi-tenant** — full workspace isolation per team
- **flow versioning** — every save creates a new version, one-click rollback
- **triggers** — run flows on cron schedule or via webhook
- **self-hostable** — Docker Compose, deploy anywhere

---

## tech stack

| layer | technology |
|-------|-----------|
| frontend | Next.js 14, TypeScript, Tailwind CSS, React Flow, shadcn/ui |
| backend | NestJS, TypeScript, WebSockets (Socket.io), BullMQ |
| database | PostgreSQL + TypeORM |
| queue | Redis + BullMQ |
| ai | OpenAI GPT-4o |
| auth | JWT + Refresh Tokens |
| devops | Docker, Docker Compose, GitHub Actions |

---

## quick start

```bash
git clone https://github.com/DIYA73/agentflow.git
cd agentflow
cp .env.example .env
# fill in your values

docker compose up -d          # starts postgres + redis
cd apps/api && npm run start:dev   # terminal 1
cd apps/web && npm run dev         # terminal 2
```

open http://localhost:3000

---

## agent node types

| node | what it does |
|------|-------------|
| `ai-llm` | send prompt to GPT-4o, pass response downstream |
| `web-scraper` | fetch & parse any URL, extract text |
| `api-caller` | HTTP request to any endpoint |
| `code-runner` | execute sandboxed JavaScript |
| `email-sender` | send email via Resend |
| `data-transform` | map, filter, or reshape JSON |
| `webhook-output` | POST results to external URL |
| `condition` | branch flow based on data condition |

---

## architecture
---

## environment variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/agentflow
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret
OPENAI_API_KEY=sk-...
PORT=3001
NODE_ENV=development
WEB_URL=http://localhost:3000
```

---

## roadmap

- [x] visual canvas with React Flow
- [x] 8 built-in agent node types
- [x] real-time execution logs via WebSocket
- [x] live node status (yellow → green/red)
- [x] BullMQ async execution engine
- [x] multi-tenant workspaces
- [x] flow versioning + rollback
- [x] cron & webhook triggers
- [ ] custom node SDK
- [ ] flow marketplace
- [ ] human-in-the-loop approval nodes
- [ ] Python SDK

---

MIT © [DIYA73](https://github.com/DIYA73) — built with ❤️

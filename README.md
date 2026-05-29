#  agentflow

<div align="center">

**Visual AI Agent Builder & Orchestration Platform**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React Flow](https://img.shields.io/badge/React_Flow-11-FF0072?style=flat-square)](https://reactflow.dev/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Live Demo](https://agentflow.vercel.app) · [API Docs](https://agentflow-api.onrender.com/api) · [Report Bug](https://github.com/DIYA73/agentflow/issues)

</div>

---

## 🖼️ Overview

**agentflow** is an open-source platform to visually build, chain, and deploy autonomous AI agents. Design complex multi-agent pipelines on a drag-and-drop canvas — no code required. Each node is a specialized agent; edges define how data flows between them.

> Build in minutes what used to take days of LangChain boilerplate.

---

## ✨ Features

- 🎨 **Visual Canvas** — Drag-and-drop agent builder powered by React Flow
- 🤖 **Built-in Agent Types** — Web scraper, code writer, API caller, email sender, data transformer, AI summarizer
- ⚡ **Real-time Execution Logs** — Watch agents run live via WebSocket
- 🔁 **Chaining & Branching** — Pass outputs between agents, conditional branches
- ⏰ **Triggers** — Run flows on schedule (cron) or via webhook
- 🏢 **Multi-tenant** — Full workspace isolation per team
- 📜 **Version History** — Every flow version saved, one-click rollback
- 🐳 **Self-hostable** — Docker Compose, deploy anywhere

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         agentflow                            │
├────────────────────────┬─────────────────────────────────────┤
│  apps/web (Next.js)    │        apps/api (NestJS)            │
│                        │                                     │
│  ┌──────────────────┐  │  ┌──────────┐  ┌────────────────┐  │
│  │  React Flow      │  │  │ REST API │  │ WebSocket GW   │  │
│  │  Canvas Editor   │◄─┼─►│          │  │ (exec logs)    │  │
│  │  Node Palette    │  │  └────┬─────┘  └──────┬─────────┘  │
│  │  Execution Logs  │  │       │                │            │
│  └──────────────────┘  │  ┌────▼────────────────▼─────────┐ │
│                        │  │         NestJS Modules         │ │
│                        │  │  flows · agents · executions   │ │
│                        │  │  nodes · triggers · gateway    │ │
│                        │  └────┬──────────┬────────────────┘ │
├────────────────────────┤       │          │                   │
│    Infrastructure      │  ┌────▼──┐  ┌───▼──────┐           │
│                        │  │  PG   │  │  Redis   │           │
│  packages/shared       │  │  DB   │  │  BullMQ  │           │
│  (types + utils)       │  └───────┘  └──────────┘           │
└────────────────────────┴─────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer      | Technology                                               |
|------------|----------------------------------------------------------|
| Frontend   | Next.js 14, TypeScript, Tailwind CSS, React Flow, shadcn/ui |
| Backend    | NestJS, TypeScript, WebSockets, BullMQ                   |
| Database   | PostgreSQL + TypeORM                                     |
| Queue      | Redis + BullMQ (async agent execution)                   |
| AI         | OpenAI GPT-4o (agent reasoning & tool calls)             |
| Auth       | JWT + Refresh Tokens                                     |
| DevOps     | Docker, Docker Compose, GitHub Actions                   |
| Deployment | Vercel (web) · Render (api) · Upstash (redis)            |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- OpenAI API Key

### 1. Clone the repo
```bash
git clone https://github.com/DIYA73/agentflow.git
cd agentflow
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your values
```

### 3. Start with Docker
```bash
docker compose up -d
```

### 4. Or run locally
```bash
npm install
cd apps/api && npm run start:dev   # Terminal 1
cd apps/web && npm run dev          # Terminal 2
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
agentflow/
├── apps/
│   ├── api/                     # NestJS backend
│   │   └── src/
│   │       ├── flows/           # Flow CRUD + versioning
│   │       ├── agents/          # Agent type registry
│   │       ├── executions/      # Run engine + BullMQ processor
│   │       ├── nodes/           # Built-in node implementations
│   │       ├── triggers/        # Cron + webhook trigger system
│   │       ├── gateway/         # WebSocket execution log stream
│   │       ├── auth/            # JWT authentication
│   │       └── workspaces/      # Multi-tenant isolation
│   └── web/                     # Next.js frontend
│       └── src/
│           ├── app/             # App Router pages
│           ├── components/
│           │   ├── canvas/      # React Flow canvas + toolbar
│           │   ├── nodes/       # Custom node renderers
│           │   └── ui/          # shadcn components
│           └── lib/             # API client, hooks, WS client
├── packages/
│   └── shared/                  # Shared TypeScript types
├── docs/                        # Architecture diagrams
├── docker-compose.yml
└── .github/workflows/           # CI/CD pipeline
```

---

## 🤖 Built-in Agent Node Types

| Node Type         | What It Does                                      |
|-------------------|---------------------------------------------------|
| `ai-llm`          | Send prompt to GPT-4o, pass response downstream   |
| `web-scraper`     | Fetch & parse any URL, extract text/links         |
| `api-caller`      | HTTP request to any endpoint (GET/POST/PUT/DELETE)|
| `code-runner`     | Execute sandboxed JavaScript or Python snippet    |
| `email-sender`    | Send email via Resend or SMTP                     |
| `data-transform`  | Map, filter, or reshape JSON data                 |
| `webhook-output`  | POST results to external URL                      |
| `condition`       | Branch flow based on data condition (if/else)     |

---

## 🔌 API Endpoints

| Method | Endpoint                          | Description                      |
|--------|-----------------------------------|----------------------------------|
| POST   | `/auth/register`                  | Create workspace + account       |
| POST   | `/auth/login`                     | JWT login                        |
| GET    | `/flows`                          | List all flows in workspace      |
| POST   | `/flows`                          | Create new flow                  |
| PUT    | `/flows/:id`                      | Save flow (creates new version)  |
| POST   | `/flows/:id/execute`              | Trigger flow execution           |
| GET    | `/executions/:id/logs`            | Get execution logs               |
| POST   | `/triggers/cron`                  | Schedule flow as cron job        |
| POST   | `/triggers/webhook`               | Register flow as webhook         |
| WS     | `/gateway`                        | Real-time execution log stream   |

---

## ⚙️ Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/agentflow

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-super-secret
JWT_EXPIRES_IN=15m

# OpenAI
OPENAI_API_KEY=sk-...

# App
PORT=3001
NODE_ENV=development
WEB_URL=http://localhost:3000
```

---

## 📈 Roadmap

- [x] Visual canvas with React Flow
- [x] Built-in agent node types (8 types)
- [x] Real-time execution logs via WebSocket
- [x] Multi-tenant workspaces
- [x] Flow versioning + rollback
- [x] Cron & webhook triggers
- [ ] Custom node SDK (bring your own agent)
- [ ] Flow marketplace (share/import community flows)
- [ ] Human-in-the-loop approval nodes
- [ ] Python SDK for programmatic flow creation

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature
git commit -m 'feat: add your feature'
git push origin feature/your-feature
```

---

## 📄 License

MIT © [DIYA73](https://github.com/DIYA73)

---

<div align="center">
  <sub>Built with ❤️ — SaaS & Microservices Engineer | Web to IoT systems 🔥</sub>
</div>

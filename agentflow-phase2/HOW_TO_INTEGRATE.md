# 🎨 Phase 2 — React Flow Canvas UI Integration

## What's in this zip

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx           ← Root layout + fonts
│   │   ├── page.tsx             ← Redirects to /login
│   │   ├── globals.css          ← Dark theme + React Flow overrides
│   │   ├── login/page.tsx       ← Login + Register page
│   │   └── flows/
│   │       ├── page.tsx         ← Flows list dashboard
│   │       └── [id]/page.tsx    ← Canvas editor
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── CanvasToolbar.tsx    ← Top bar (save, run, status)
│   │   │   ├── NodePalette.tsx      ← Left sidebar (drag/click to add)
│   │   │   ├── NodeConfigPanel.tsx  ← Right sidebar (edit node config)
│   │   │   └── ExecutionLogsPanel.tsx ← Live WebSocket log stream
│   │   └── nodes/
│   │       └── AgentNode.tsx        ← Custom node renderer
│   ├── store/
│   │   ├── auth.store.ts        ← Zustand auth state
│   │   └── canvas.store.ts      ← Zustand canvas state (nodes/edges)
│   ├── lib/
│   │   ├── api.ts               ← Axios client + auth/flows API calls
│   │   └── node-registry.ts     ← All 8 node type metadata
│   └── hooks/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── postcss.config.js
```

---

## Step 1 — Copy files

```bash
cd ~/Downloads
unzip agentflow-phase2.zip

# Copy entire web app
cp -r agentflow-phase2/apps/web ~/Documents/GitHub/agentflow/apps/
```

---

## Step 2 — Install dependencies

```bash
cd ~/Documents/GitHub/agentflow/apps/web
npm install
```

---

## Step 3 — Add .env

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
EOF
```

---

## Step 4 — Start the web app

```bash
npm run dev
```

Open http://localhost:3000

---

## Step 5 — Test the full flow

1. Go to `http://localhost:3000` → redirects to `/login`
2. Register with your credentials (or use existing account)
3. You'll land on `/flows` — the flows list
4. Click **New Flow** → name it → opens the canvas editor
5. **Drag nodes** from the left palette onto the canvas
6. **Click a node** → configure it in the right panel
7. **Connect nodes** by dragging from the right handle to the left handle of another
8. Click **Save** → saves the graph to the API
9. Click **Run Flow** → starts execution, opens the live log panel

---

## Make sure API is running

```bash
# Terminal 1 — API
cd ~/Documents/GitHub/agentflow/apps/api
npm run start:dev

# Terminal 2 — Web
cd ~/Documents/GitHub/agentflow/apps/web
npm run dev
```

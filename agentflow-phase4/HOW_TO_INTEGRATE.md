# ⏰ Phase 4 — Triggers UI Integration

## What's new

```
apps/web/src/
├── lib/
│   └── triggers-api.ts              ← Trigger API client + cron parser + presets
├── components/triggers/
│   ├── CronTriggerModal.tsx         ← Preset picker + custom cron input + preview
│   ├── WebhookTriggerModal.tsx      ← Webhook URL generator + copy + test example
│   ├── TriggerCard.tsx              ← Toggle on/off + delete per trigger
│   └── TriggerPanel.tsx            ← Slide-in panel inside canvas editor
├── components/canvas/
│   └── CanvasToolbar.tsx           ← UPDATED: Triggers button added
├── components/layout/
│   └── AppShell.tsx                ← UPDATED: Triggers nav item added
└── app/
    ├── triggers/
    │   ├── layout.tsx              ← NEW page
    │   └── page.tsx               ← Full trigger management page
    └── flows/[id]/
        └── page.tsx               ← UPDATED: TriggerPanel integrated

apps/api/src/triggers/
└── triggers.controller.ts          ← NEW: REST endpoints
```

---

## Step 1 — Copy web files

```bash
cd ~/Documents/GitHub/agentflow

# Trigger components
cp -r agentflow-phase4/apps/web/src/components/triggers \
      apps/web/src/components/

# Updated toolbar + AppShell
cp agentflow-phase4/apps/web/src/components/canvas/CanvasToolbar.tsx \
   apps/web/src/components/canvas/

cp agentflow-phase4/apps/web/src/components/layout/AppShell.tsx \
   apps/web/src/components/layout/

# New triggers lib
cp agentflow-phase4/apps/web/src/lib/triggers-api.ts \
   apps/web/src/lib/

# Triggers page
cp -r agentflow-phase4/apps/web/src/app/triggers \
      apps/web/src/app/

# Updated canvas editor
cp agentflow-phase4/apps/web/src/app/flows/\[id\]/page.tsx \
   apps/web/src/app/flows/\[id\]/
```

---

## Step 2 — Copy API files

```bash
cp agentflow-phase4/apps/api/src/triggers/triggers.controller.ts \
   apps/api/src/triggers/
```

---

## Step 3 — Test it

1. Go to `http://localhost:3000/triggers`
2. Select a flow from the dropdown
3. Click **+ Cron Schedule** → pick a preset → Create
4. Click **+ Webhook** → Generate → copy URL → test with curl
5. Toggle triggers on/off
6. In the canvas editor, click **Triggers** button in the toolbar

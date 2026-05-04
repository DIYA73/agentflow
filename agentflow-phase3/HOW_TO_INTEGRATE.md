# 📊 Phase 3 — Dashboard UI Integration

## What's new

```
apps/web/src/
├── components/layout/
│   └── AppShell.tsx          ← Collapsible sidebar nav (Dashboard/Flows/Executions/Settings)
├── components/dashboard/
│   ├── StatCard.tsx          ← Metric cards with trend indicators
│   ├── ActivityFeed.tsx      ← Execution activity list with status dots
│   └── SparkBar.tsx          ← Mini bar chart component
└── app/
    ├── page.tsx              ← Now redirects to /dashboard
    ├── dashboard/
    │   ├── layout.tsx        ← Wraps with AppShell
    │   └── page.tsx          ← Full dashboard: stats, chart, recent flows, activity
    ├── flows/
    │   └── layout.tsx        ← Wraps flows list + canvas with AppShell
    ├── executions/
    │   ├── layout.tsx
    │   └── page.tsx          ← Full executions table with filters + expandable logs
    └── settings/
        ├── layout.tsx
        └── page.tsx          ← Profile, workspace, API key, danger zone

apps/api/src/executions/
├── executions.controller.ts  ← NEW: GET /executions endpoint
└── executions.service.ts     ← UPDATED: adds findByWorkspace()
```

---

## Step 1 — Copy web files

```bash
cd ~/Downloads
unzip agentflow-phase3.zip

# Copy new web components
cp -r agentflow-phase3/apps/web/src/components/layout \
      ~/Documents/GitHub/agentflow/apps/web/src/components/

cp -r agentflow-phase3/apps/web/src/components/dashboard \
      ~/Documents/GitHub/agentflow/apps/web/src/components/

# Copy new pages
cp -r agentflow-phase3/apps/web/src/app/dashboard \
      ~/Documents/GitHub/agentflow/apps/web/src/app/

cp -r agentflow-phase3/apps/web/src/app/executions \
      ~/Documents/GitHub/agentflow/apps/web/src/app/

cp -r agentflow-phase3/apps/web/src/app/settings \
      ~/Documents/GitHub/agentflow/apps/web/src/app/

# Add layout to flows directory
cp agentflow-phase3/apps/web/src/app/flows/layout.tsx \
   ~/Documents/GitHub/agentflow/apps/web/src/app/flows/

# Update root redirect
cp agentflow-phase3/apps/web/src/app/page.tsx \
   ~/Documents/GitHub/agentflow/apps/web/src/app/
```

---

## Step 2 — Copy API updates

```bash
# Add executions controller
cp agentflow-phase3/apps/api/src/executions/executions.controller.ts \
   ~/Documents/GitHub/agentflow/apps/api/src/executions/

# Update executions service (adds findByWorkspace)
cp agentflow-phase3/apps/api/src/executions/executions.service.ts \
   ~/Documents/GitHub/agentflow/apps/api/src/executions/
```

---

## Step 3 — Verify and restart

```bash
# API should auto-restart (watch mode)
# Web:
cd ~/Documents/GitHub/agentflow/apps/web
npm run dev
```

---

## What you'll see

- `http://localhost:3000` → redirects to `/dashboard`
- **Dashboard**: greeting, 4 stat cards, 7-day bar chart, recent flows, recent executions
- **Executions**: filterable table with expandable log rows
- **Settings**: profile (read-only), workspace name edit, API key viewer, danger zone
- **Sidebar**: collapsible nav with active state indicators

# 🔐 Phase 1 — Auth Module Integration Guide

## What's in this zip

```
apps/api/src/
├── auth/
│   ├── auth.service.ts        ← Core logic: register, login, refresh, logout
│   ├── auth.controller.ts     ← REST endpoints
│   ├── auth.module.ts         ← Module wiring
│   └── dto/
│       └── auth.dto.ts        ← RegisterDto, LoginDto, RefreshDto
├── users/
│   └── entities/
│       └── user.entity.ts     ← User DB model
├── workspaces/
│   ├── workspace.entity.ts    ← Workspace DB model
│   ├── workspaces.service.ts
│   ├── workspaces.controller.ts
│   └── workspaces.module.ts
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts  ← Protects all routes globally
│   │   └── roles.guard.ts     ← OWNER / ADMIN / MEMBER enforcement
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── jwt-refresh.strategy.ts
│   └── decorators/
│       ├── current-user.decorator.ts   ← @CurrentUser(), @CurrentWorkspaceId()
│       ├── public.decorator.ts         ← @Public()
│       └── roles.decorator.ts          ← @Roles(UserRole.OWNER)
└── app.module.ts              ← Updated with global guards
```

---

## Step 1 — Copy files into your agentflow project

```bash
# From your Downloads folder after unzipping:
cp -r agentflow-auth/apps/api/src/auth       agentflow/apps/api/src/
cp -r agentflow-auth/apps/api/src/users      agentflow/apps/api/src/
cp -r agentflow-auth/apps/api/src/workspaces agentflow/apps/api/src/
cp -r agentflow-auth/apps/api/src/common     agentflow/apps/api/src/
```

---

## Step 2 — Update your app.module.ts

Replace your existing `app.module.ts` with the one provided, then
**uncomment** your existing module imports (FlowsModule, etc.):

```typescript
// Uncomment these in app.module.ts:
import { FlowsModule } from './flows/flows.module';
import { ExecutionsModule } from './executions/executions.module';
import { NodesModule } from './nodes/nodes.module';
import { TriggersModule } from './triggers/triggers.module';
import { GatewayModule } from './gateway/gateway.module';
```

---

## Step 3 — Install new dependencies

```bash
cd agentflow/apps/api
npm install bcrypt @types/bcrypt passport passport-jwt @nestjs/passport @nestjs/jwt
```

---

## Step 4 — Mark public routes with @Public()

In your `auth.controller.ts`, the `register` and `login` routes are already
public. For any other routes you want to skip auth on:

```typescript
import { Public } from '../common/decorators/public.decorator';

@Public()
@Get('health')
healthCheck() { return 'ok'; }
```

---

## Step 5 — Protect your flows routes

In `flows.controller.ts`, inject the workspace from the JWT:

```typescript
import { CurrentWorkspaceId } from '../common/decorators/current-user.decorator';

@Get()
findAll(@CurrentWorkspaceId() workspaceId: string) {
  return this.flowsService.findAll(workspaceId);  // already scoped!
}

@Delete(':id')
@Roles(UserRole.OWNER, UserRole.ADMIN)
remove(@Param('id') id: string, @CurrentWorkspaceId() workspaceId: string) {
  return this.flowsService.remove(id, workspaceId);
}
```

---

## Step 6 — Test it

```bash
# Start the API
cd agentflow/apps/api
npm run start:dev

# Open Swagger
open http://localhost:3001/api

# Try in order:
# 1. POST /auth/register
# 2. Copy accessToken from response
# 3. Click "Authorize" button in Swagger → paste token
# 4. GET /workspace → should return your workspace
# 5. GET /flows → should return [] (empty, but authenticated!)
```

---

## API Reference

| Method | Endpoint          | Auth? | Description                        |
|--------|-------------------|-------|------------------------------------|
| POST   | /auth/register    | ❌    | Create account + workspace         |
| POST   | /auth/login       | ❌    | Login → get tokens                 |
| POST   | /auth/refresh     | ✅    | Refresh access token               |
| POST   | /auth/logout      | ✅    | Invalidate refresh token           |
| POST   | /auth/me          | ✅    | Get current user from JWT          |
| GET    | /workspace        | ✅    | Get your workspace info            |
| GET    | /workspace/members| ✅    | List all members                   |
| PATCH  | /workspace        | 👑    | Update workspace (OWNER/ADMIN only)|

---

## Token Flow

```
Register/Login
      ↓
  accessToken (15min)  +  refreshToken (7d)
      ↓                          ↓
Use in Authorization:        POST /auth/refresh
Bearer {accessToken}         → new accessToken
      ↓
  Expires? → refresh
  Logout?  → refreshToken invalidated in DB
```

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';

// ── Import your existing modules ──────────────────────────
// import { FlowsModule } from './flows/flows.module';
// import { ExecutionsModule } from './executions/executions.module';
// import { NodesModule } from './nodes/nodes.module';
// import { TriggersModule } from './triggers/triggers.module';
// import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),

    AuthModule,
    WorkspacesModule,

    // FlowsModule,
    // ExecutionsModule,
    // NodesModule,
    // TriggersModule,
    // GatewayModule,
  ],
  providers: [
    // ✅ Register guards GLOBALLY — every route is protected by default
    // Use @Public() on routes that should skip auth (register, login)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

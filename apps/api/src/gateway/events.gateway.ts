import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ExecutionsService } from '../executions/executions.service';
import type { JwtPayload } from '../auth/auth.service';

interface AuthenticatedSocket extends Socket {
  data: { user?: JwtPayload };
}

@WebSocketGateway({
  cors: {
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/gateway',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly executionsService: ExecutionsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    const token =
      (client.handshake.auth?.token as string) ||
      client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.get('JWT_SECRET'),
      });
      client.data.user = payload;
      this.logger.log(`Client connected: ${client.id} (${payload.email})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:execution')
  async handleJoinExecution(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { executionId: string },
  ): Promise<void> {
    const user = client.data.user;
    if (!user) {
      client.disconnect();
      return;
    }

    const execution = await this.executionsService.findOne(data.executionId, user.workspaceId);
    if (!execution) {
      throw new UnauthorizedException('Execution not found');
    }

    client.join(`execution:${data.executionId}`);
    client.emit('joined', { room: `execution:${data.executionId}` });
  }

  @SubscribeMessage('join:workspace')
  handleJoinWorkspace(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { workspaceId: string },
  ): void {
    const user = client.data.user;
    if (!user || user.workspaceId !== data.workspaceId) {
      throw new UnauthorizedException('Workspace access denied');
    }

    client.join(`workspace:${data.workspaceId}`);
    client.emit('joined', { room: `workspace:${data.workspaceId}` });
  }

  @OnEvent('execution.log')
  broadcastLog(payload: {
    executionId: string;
    nodeId: string;
    message: string;
    level: string;
    timestamp: string;
  }): void {
    this.server.to(`execution:${payload.executionId}`).emit('execution:log', payload);
  }

  @OnEvent('execution.status')
  broadcastStatus(payload: { executionId: string; status: string }): void {
    this.server.to(`execution:${payload.executionId}`).emit('execution:status', payload);
  }

  @OnEvent('execution.node.status')
  broadcastNodeStatus(payload: {
    executionId: string;
    nodeId: string;
    status: 'running' | 'success' | 'error';
  }): void {
    this.server
      .to(`execution:${payload.executionId}`)
      .emit('execution:node:status', payload);
  }
}

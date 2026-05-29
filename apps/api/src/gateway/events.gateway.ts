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
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/gateway' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:execution')
  handleJoinExecution(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { executionId: string },
  ): void {
    client.join(`execution:${data.executionId}`);
    client.emit('joined', { room: `execution:${data.executionId}` });
  }

  @SubscribeMessage('join:workspace')
  handleJoinWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
  ): void {
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

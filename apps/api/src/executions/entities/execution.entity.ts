import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ExecutionStatus {
  QUEUED  = 'queued',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED  = 'failed',
}

@Entity('executions')
export class Execution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  flowId: string;

  @Column()
  workspaceId: string;

  @Column({ type: 'enum', enum: ExecutionStatus, default: ExecutionStatus.QUEUED })
  status: ExecutionStatus;

  @Column({ type: 'jsonb', default: {} })
  input: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  output: unknown;

  @Column({ type: 'jsonb', default: [] })
  logs: unknown[];

  @Column({ nullable: true })
  startedAt: Date | null;

  @Column({ nullable: true })
  finishedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}

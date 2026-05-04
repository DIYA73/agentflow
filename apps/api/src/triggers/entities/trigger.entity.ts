import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum TriggerType {
  CRON    = 'cron',
  WEBHOOK = 'webhook',
}

@Entity('triggers')
export class Trigger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workspaceId: string;

  @Column()
  flowId: string;

  @Column({ type: 'enum', enum: TriggerType })
  type: TriggerType;

  @Column({ type: 'jsonb', default: {} })
  config: Record<string, unknown>;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

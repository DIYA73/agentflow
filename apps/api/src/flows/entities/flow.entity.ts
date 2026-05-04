import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Workspace } from '../../workspaces/entities/workspace.entity';

export enum FlowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

export interface FlowNode {
  id: string;
  type: string;           // 'ai-llm' | 'web-scraper' | 'api-caller' | etc.
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, unknown>;  // node-specific config
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

export interface FlowGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

@Entity('flows')
@Index(['workspace', 'status'])
export class Flow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Workspace;

  @Column()
  workspaceId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: FlowStatus, default: FlowStatus.DRAFT })
  status: FlowStatus;

  @Column({ type: 'jsonb', default: { nodes: [], edges: [] } })
  graph: FlowGraph;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'jsonb', nullable: true })
  versionHistory: Array<{ version: number; graph: FlowGraph; savedAt: string }> | null;

  @Column({ nullable: true })
  lastRunAt: Date | null;

  @Column({ nullable: true })
  lastRunStatus: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

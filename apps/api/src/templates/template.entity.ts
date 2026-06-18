import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import type { FlowGraph } from '../flows/entities/flow.entity';

export const TemplateCategory = {
  AI: 'ai',
  DATA: 'data',
  AUTOMATION: 'automation',
  MONITORING: 'monitoring',
  COMMUNICATION: 'communication',
} as const;
export type TemplateCategory = typeof TemplateCategory[keyof typeof TemplateCategory];

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar' })
  category!: TemplateCategory;

  @Column({ nullable: true, type: 'varchar' })
  icon!: string | null;

  @Column({ type: 'jsonb' })
  graph!: FlowGraph;

  @Column({ default: 0 })
  useCount!: number;

  @Column({ default: true })
  isBuiltin!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}

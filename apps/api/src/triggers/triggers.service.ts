import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Trigger, TriggerType } from './entities/trigger.entity';
import { FlowsService } from '../flows/flows.service';
import { CreateTriggerDto } from './dto/create-trigger.dto';

@Injectable()
export class TriggersService {
  private readonly logger = new Logger(TriggersService.name);

  constructor(
    @InjectRepository(Trigger)
    private readonly triggerRepo: Repository<Trigger>,
    private readonly flowsService: FlowsService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async createCronTrigger(workspaceId: string, dto: CreateTriggerDto): Promise<Trigger> {
    const trigger = this.triggerRepo.create({
      workspaceId,
      flowId: dto.flowId,
      type: TriggerType.CRON,
      config: { cronExpression: dto.cronExpression },
      isActive: true,
    });
    const saved = await this.triggerRepo.save(trigger);
    this.registerCronJob(saved);
    return saved;
  }

  async createWebhookTrigger(workspaceId: string, dto: CreateTriggerDto): Promise<Trigger> {
    const webhookPath = `/webhooks/${crypto.randomUUID()}`;
    const trigger = this.triggerRepo.create({
      workspaceId,
      flowId: dto.flowId,
      type: TriggerType.WEBHOOK,
      config: { webhookPath, secret: dto.webhookSecret },
      isActive: true,
    });
    return this.triggerRepo.save(trigger);
  }

  async toggle(id: string, isActive: boolean): Promise<Trigger> {
    await this.triggerRepo.update(id, { isActive });
    const trigger = await this.triggerRepo.findOne({ where: { id } });
    if (!trigger) throw new NotFoundException(`Trigger ${id} not found`);
    return trigger;
  }

  async findAll(workspaceId: string): Promise<Trigger[]> {
    return this.triggerRepo.find({ where: { workspaceId } });
  }

  async findByWebhookPath(path: string): Promise<Trigger | null> {
    // Query the JSONB config directly instead of loading every active webhook
    // trigger and filtering in memory.
    return this.triggerRepo
      .createQueryBuilder('trigger')
      .where('trigger.type = :type', { type: TriggerType.WEBHOOK })
      .andWhere('trigger.isActive = :active', { active: true })
      .andWhere("trigger.config ->> 'webhookPath' = :path", { path })
      .getOne();
  }

  async fireWebhook(trigger: Trigger, payload: Record<string, unknown>) {
    const result = await this.flowsService.execute(trigger.flowId, trigger.workspaceId);
    return { executionId: result.id, status: result.status, payload };
  }

  async remove(id: string, workspaceId: string): Promise<void> {
    const trigger = await this.triggerRepo.findOne({ where: { id, workspaceId } });
    if (!trigger) throw new NotFoundException(`Trigger ${id} not found`);
    if (trigger.type === TriggerType.CRON) {
      try { this.schedulerRegistry.deleteCronJob(`trigger-${id}`); } catch { }
    }
    await this.triggerRepo.remove(trigger);
  }

  private registerCronJob(trigger: Trigger): void {
    const { cronExpression } = trigger.config as { cronExpression: string };
    const job = new CronJob(cronExpression, async () => {
      this.logger.log(`Cron trigger firing for flow ${trigger.flowId}`);
      await this.flowsService.execute(trigger.flowId, trigger.workspaceId);
    });
    this.schedulerRegistry.addCronJob(`trigger-${trigger.id}`, job);
    job.start();
  }
}

import { Controller, Post, Param, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { TriggersService } from './triggers.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly triggersService: TriggersService) {}

  @Public()
  @Post(':token')
  async receive(
    @Param('token') token: string,
    @Body() body: Record<string, unknown>,
    @Headers('x-webhook-secret') secret?: string,
  ) {
    const path = `/webhooks/${token}`;
    const trigger = await this.triggersService.findByWebhookPath(path);
    if (!trigger || !trigger.isActive) {
      throw new UnauthorizedException('Invalid webhook');
    }

    const config = trigger.config as { secret?: string };
    if (config.secret && config.secret !== secret) {
      throw new UnauthorizedException('Invalid webhook secret');
    }

    return this.triggersService.fireWebhook(trigger, body);
  }
}

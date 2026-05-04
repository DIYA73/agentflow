import { IsString, IsOptional } from 'class-validator';

export class CreateTriggerDto {
  @IsString()
  flowId: string;

  @IsString()
  @IsOptional()
  cronExpression?: string;

  @IsString()
  @IsOptional()
  webhookSecret?: string;
}

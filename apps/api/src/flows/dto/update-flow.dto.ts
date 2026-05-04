import { IsString, IsOptional } from 'class-validator';
import { FlowGraph, FlowStatus } from '../entities/flow.entity';

export class UpdateFlowDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  graph?: FlowGraph;

  @IsOptional()
  status?: FlowStatus;
}

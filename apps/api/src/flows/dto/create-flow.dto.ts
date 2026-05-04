import { IsString, IsOptional } from 'class-validator';
import { FlowGraph } from '../entities/flow.entity';

export class CreateFlowDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  graph?: FlowGraph;
}

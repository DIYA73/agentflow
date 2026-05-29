import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionsService, EXECUTION_QUEUE } from './executions.service';
import { ExecutionsController } from './executions.controller';
import { ExecutionProcessor } from './execution.processor';
import { Execution } from './entities/execution.entity';
import { NodesModule } from '../nodes/nodes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Execution]),
    BullModule.registerQueue({ name: EXECUTION_QUEUE }),
    NodesModule,
  ],
  controllers: [ExecutionsController],
  providers: [ExecutionsService, ExecutionProcessor],
  exports: [ExecutionsService],
})
export class ExecutionsModule {}

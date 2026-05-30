import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';
import { Flow } from './entities/flow.entity';
import { ExecutionsModule } from '../executions/executions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Flow]), ExecutionsModule],
  controllers: [FlowsController],
  providers: [FlowsService],
  exports: [FlowsService],
})
export class FlowsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';
import { Flow } from './entities/flow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Flow])],
  controllers: [FlowsController],
  providers: [FlowsService],
  exports: [FlowsService],
})
export class FlowsModule {}

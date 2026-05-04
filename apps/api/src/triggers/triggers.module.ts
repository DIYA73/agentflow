import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TriggersController } from './triggers.controller';
import { TriggersService } from './triggers.service';
import { Trigger } from './entities/trigger.entity';
import { FlowsModule } from '../flows/flows.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trigger]), FlowsModule],
  controllers: [TriggersController],
  providers: [TriggersService],
  exports: [TriggersService],
})
export class TriggersModule {}

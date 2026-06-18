import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template } from './template.entity';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { FlowsModule } from '../flows/flows.module';

@Module({
  imports: [TypeOrmModule.forFeature([Template]), FlowsModule],
  providers: [TemplatesService],
  controllers: [TemplatesController],
})
export class TemplatesModule {}

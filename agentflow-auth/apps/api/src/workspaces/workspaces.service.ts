import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<Workspace> {
    const workspace = await this.workspaceRepo.findOne({ where: { id } });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }

  async getMembers(workspaceId: string): Promise<User[]> {
    return this.userRepo.find({
      where: { workspaceId },
      select: ['id', 'name', 'email', 'role', 'createdAt'],
    });
  }

  async update(id: string, data: Partial<Workspace>): Promise<Workspace> {
    await this.workspaceRepo.update(id, data);
    return this.findById(id);
  }
}

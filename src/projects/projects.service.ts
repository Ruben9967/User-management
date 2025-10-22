import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async createProject(userId: number, name: string, description: string) {
    return this.prisma.project.create({
      data: {
        name,
        description,
        ownerId: userId,
      },
    });
  }
 
  async getProjects(user: any) {
    if (user.role === 'ADMIN') {
      return this.prisma.project.findMany({
        include: { owner: { select: { name: true, email: true } } },
      });
    }
    // Normal user – show only their projects
    return this.prisma.project.findMany({
      where: { ownerId: user.userId },
    });
  }

  async getProjectById(id: number, user: any) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new ForbiddenException('Project not found');

    if (user.role !== 'ADMIN' && project.ownerId !== user.userId) {
      throw new ForbiddenException('Access denied');
    }
    return project;
  }

  async updateProject(id: number, data: any, user: any) {
    const project = await this.getProjectById(id, user);
    return this.prisma.project.update({
      where: { id: project.id },
      data,
    });
  }

  async deleteProject(id: number, user: any) {
    const project = await this.getProjectById(id, user);
    return this.prisma.project.delete({ where: { id: project.id } });
  }
}

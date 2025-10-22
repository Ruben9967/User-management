import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async createProject(userId: number, name: string, description: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new ForbiddenException('User not found');
    }
    if (user.role !== 'admin' && user.role !== 'manager') {
      throw new ForbiddenException('Only admins or managers can create projects');
    }

    return this.prisma.project.create({
      data: {
        name,
        description,
        managerId: user.role === 'manager' ? user.id : null,
      },
    });
  }

  async getUserProjects(user: any) {
  if (user.role === 'admin') {
    return this.prisma.project.findMany({
      include: { manager: true, users: true },
    });
  }

  if (user.role === 'manager') {
    return this.prisma.project.findMany({
      where: { managerId: user.id }, // 👈 Fixed
      include: { users: true },
    });
  }

  return this.prisma.project.findMany({
    where: { users: { some: { id: user.id } } }, // 👈 Fixed
    include: { manager: true },
  });
}


  async getProjectById(id: number) {
    return this.prisma.project.findUnique({
      where: { id },
      include: { manager: true, users: true },
    });
  }

  async deleteProject(id: number, user: any) {
    if (user.role !== 'admin') throw new ForbiddenException('Only admin can delete projects');
    return this.prisma.project.delete({ where: { id } });
  }
}

import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client'; // ✅ import Prisma enum

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async createProject(userId: number, name: string, description: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (user.role !== Role.ADMIN && user.role !== Role.MANAGER) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.project.create({
      data: {
        name,
        description,
        ownerId: user.id,
        managerId: user.role === Role.MANAGER ? user.id : null,
      },
    });
  }

  async getUserProjects(user: any) {
    if (user.role === Role.ADMIN) {
      return this.prisma.project.findMany({
        include: { manager: true, users: true },
      });
    }

    if (user.role === Role.MANAGER) {
      return this.prisma.project.findMany({
        where: { managerId: user.id },
        include: { users: true },
      });
    }

    return this.prisma.project.findMany({
      where: { users: { some: { id: user.id } } },
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
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admin can delete projects');
    }

    return this.prisma.project.delete({ where: { id } });
  }
}

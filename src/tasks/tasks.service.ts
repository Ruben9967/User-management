import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TaskStatus, User } from '@prisma/client';

interface UserPayload {
  userId: number;
  role: 'ADMIN' | 'MANAGER' | 'USER';
}

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  private async validateTaskOwnership(taskId: number, user: UserPayload) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) throw new ForbiddenException('Task not found');

    const isAdmin = user.role === 'ADMIN';
    const isOwner = task.project.ownerId === user.userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }

  async addTask(
    user: UserPayload,
    projectId: number,
    title: string,
    description?: string,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new ForbiddenException('Project not found');

    if (user.role !== 'ADMIN' && project.ownerId !== user.userId) {
      throw new ForbiddenException('Access denied to this project');
    }

    return this.prisma.task.create({
      data: {
        title,
        description: description || null,
        projectId,
      },
    });
  }

  async getTasks(user: UserPayload, projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new ForbiddenException('Project not found');

    if (user.role !== 'ADMIN' && project.ownerId !== user.userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignedTo: { select: { name: true, email: true } },
      },
    });
  }

  async updateTask(user: UserPayload, taskId: number, data: Partial<{ title: string; description: string; status: TaskStatus }>) {
    await this.validateTaskOwnership(taskId, user);

    return this.prisma.task.update({
      where: { id: taskId },
      data,
    });
  }

  async changeStatus(user: UserPayload, taskId: number, status: TaskStatus) {
    const validStatuses = Object.values(TaskStatus);
    if (!validStatuses.includes(status)) {
      throw new ForbiddenException('Invalid status');
    }

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) throw new ForbiddenException('Task not found');

    const isAdmin = user.role === 'ADMIN';
    const isOwner = task.project.ownerId === user.userId;
    const isAssignedUser = task.assignedToId === user.userId;

    if (!isAdmin && !isOwner && !isAssignedUser) {
      throw new ForbiddenException('You cannot modify this task');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
  }

  async assignUser(user: UserPayload, taskId: number, userId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: { users: true },
        },
      },
    });

    if (!task) throw new ForbiddenException('Task not found');

    const isAdmin = user.role === 'ADMIN';
    const isOwner = task.project.ownerId === user.userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You cannot assign users to this task');
    }

    // Optional: Ensure assigned user is part of project team
    const userIsInProject = task.project.users.some((u) => u.id === userId);
    if (!userIsInProject) {
      throw new ForbiddenException('User is not part of the project');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { assignedToId: userId },
    });
  }

  async deleteTask(user: UserPayload, taskId: number) {
    await this.validateTaskOwnership(taskId, user);

    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }
}

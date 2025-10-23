import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TaskStatus, ActionType, User } from '@prisma/client';
import { ActivityService } from 'src/activity/activity.service';

interface UserPayload {
  userId: number;
  role: 'ADMIN' | 'MANAGER' | 'USER';
}

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

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

    const task = await this.prisma.task.create({
      data: {
        title,
        description: description || null,
        projectId,
      },
    });

    await this.activityService.logAction(
      user.userId,
      projectId,
      ActionType.CREATE_TASK,
      `Added task "${title}"`,
    );

    return task;
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

  async updateTask(
    user: UserPayload,
    taskId: number,
    data: Partial<{ title: string; description: string; status: TaskStatus }>,
  ) {
    const task = await this.validateTaskOwnership(taskId, user);

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data,
    });

    await this.activityService.logAction(
      user.userId,
      task.projectId,
      ActionType.UPDATE_TASK,
      `Updated task "${task.title}"`,
    );

    return updated;
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

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    await this.activityService.logAction(
      user.userId,
      task.projectId,
      ActionType.CHANGE_STATUS,
      `Changed status of "${task.title}" to ${status}`,
    );

    return updated;
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

    const userIsInProject = task.project.users.some((u) => u.id === userId);
    if (!userIsInProject) {
      throw new ForbiddenException('User is not part of the project');
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: { assignedToId: userId },
    });

    await this.activityService.logAction(
      user.userId,
      task.projectId,
      ActionType.ASSIGN_USER,
      `Assigned user ID ${userId} to task "${task.title}"`,
    );

    return updated;
  }

  async deleteTask(user: UserPayload, taskId: number) {
    const task = await this.validateTaskOwnership(taskId, user);

    await this.prisma.task.delete({
      where: { id: taskId },
    });

    await this.activityService.logAction(
      user.userId,
      task.projectId,
      ActionType.DELETE_TASK,
      `Deleted task "${task.title}"`,
    );

    return { message: 'Task deleted' };
  }
}

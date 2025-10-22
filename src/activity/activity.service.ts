import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActionType } from '@prisma/client';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  // Updated logAction to accept optional description and nullable projectId
  async logAction(
    userId: number,
    projectId: number | null,
    action: ActionType,
    description?: string,
  ) {
    return this.prisma.activityLog.create({
      data: {
        userId,
        projectId,
        action,
        description,
      },
    });
  }

  // Get all logs for a given project, including user info
  async getLogsByProject(projectId: number) {
    return this.prisma.activityLog.findMany({
      where: { projectId },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  // Get all logs for a given user, including project info
  async getLogsByUser(userId: number) {
    return this.prisma.activityLog.findMany({
      where: { userId },
      include: {
        project: {
          select: { name: true },
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  // Get all logs with full user and project details
  async getAllLogs() {
    return this.prisma.activityLog.findMany({
      include: { user: true, project: true },
      orderBy: { timestamp: 'desc' },
    });
  }
}

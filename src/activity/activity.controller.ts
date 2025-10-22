import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('activity')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get('project/:projectId')
  getProjectLogs(@Param('projectId') projectId: string) {
    return this.activityService.getLogsByProject(+projectId);
  }

  @Get('user')
  getUserLogs(@Request() req) {
    return this.activityService.getLogsByUser(req.user.userId);
  }

  @Get('all')
  getAllLogs(@Request() req) {
    if (req.user.role !== 'ADMIN') {
      return { message: 'Access denied' };
    }
    return this.activityService.getAllLogs();
  }
}

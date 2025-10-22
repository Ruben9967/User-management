import { Controller, Post, Get, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post(':projectId')
  addTask(@Param('projectId') projectId: string, @Body() body: any, @Request() req) {
    return this.tasksService.addTask(req.user, +projectId, body.title, body.description);
  }

  @Get(':projectId')
  getTasks(@Param('projectId') projectId: string, @Request() req) {
    return this.tasksService.getTasks(req.user, +projectId);
  }

  @Patch(':taskId')
  updateTask(@Param('taskId') taskId: string, @Body() body: any, @Request() req) {
    return this.tasksService.updateTask(req.user, +taskId, body);
  }

  @Patch(':taskId/status')
  changeStatus(@Param('taskId') taskId: string, @Body() body: any, @Request() req) {
    return this.tasksService.changeStatus(req.user, +taskId, body.status);
  }

  @Patch(':taskId/assign')
  assignUser(@Param('taskId') taskId: string, @Body() body: any, @Request() req) {
    return this.tasksService.assignUser(req.user, +taskId, body.userId);
  }

  @Delete(':taskId')
  deleteTask(@Param('taskId') taskId: string, @Request() req) {
    return this.tasksService.deleteTask(req.user, +taskId);
  }
}

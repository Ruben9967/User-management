import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('create')
  async createProject(
    @Request() req,
    @Body() body: { name: string; description: string },
  ) {
    return this.projectService.createProject(req.user.userId, body.name, body.description);
  }

  @Get()
  async getUserProjects(@Request() req) {
    return this.projectService.getUserProjects(req.user);
  }

  @Get(':id')
  async getProject(@Param('id') id: string) {
    return this.projectService.getProjectById(Number(id));
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string, @Request() req) {
    return this.projectService.deleteProject(Number(id), req.user);
  }
}

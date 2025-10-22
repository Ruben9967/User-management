import { Controller, Post, Get, Body, Param, Delete, Patch, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from 'src/auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UseGuards as NestUseGuards } from '@nestjs/common';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  createProject(@Body() body: any, @Request() req) {
    return this.projectsService.createProject(req.user.userId, body.title, body.description);
  }

  @Get()
  getAllProjects(@Request() req) {
    return this.projectsService.getProjects(req.user);
  }

  @Get(':id')
  getProjectById(@Param('id') id: string, @Request() req) {
    return this.projectsService.getProjectById(+id, req.user);
  }

  @Patch(':id')
  updateProject(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.projectsService.updateProject(+id, body, req.user);
  }

  @Delete(':id')
  deleteProject(@Param('id') id: string, @Request() req) {
    return this.projectsService.deleteProject(+id, req.user);
  }
}

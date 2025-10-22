import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { ActivityModule } from './activity/activity.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [AuthModule, UserModule, PrismaModule, ProjectModule, ProjectsModule, TasksModule, ActivityModule, ProfileModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

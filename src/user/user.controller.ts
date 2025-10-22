import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('user')
export class UserController {
    constructor(private prisma: PrismaService){}

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req){
        return this.prisma.user.findUnique({where: {id: req.user.userId} });
    }
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get('all')
    getAllUsers(){
        return this.prisma.user.findMany();
    }

}

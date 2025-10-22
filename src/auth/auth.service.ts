import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private prisma: PrismaService){}

    async signup(name: string, email:string, password: string){
        const existing = await this.prisma.user.findUnique({where: {email}});
        if(existing) throw new UnauthorizedException('Email exists already');

        const hashed = await bcrypt.hash(password,10);
        const user = await this.prisma.user.create({
            data: {name,email,password: hashed},
        });
        return {message: 'Signup done', user: {id:user.id, email: user.email}};
    }
    async login(email: string, password: string){
        const user = await this.prisma.user.findUnique({where: {email}});
        if(!user) throw new UnauthorizedException('Invalid crdentials');

        const valid = await bcrypt.compare(password, user.password);
        if(!valid) throw new UnauthorizedException('Invalid crdentials');

        const payload = {sub: user.id, role: user.role};
        const token = this.jwtService.sign(payload);
        return {access_token: token, role:user.role};
    }
}

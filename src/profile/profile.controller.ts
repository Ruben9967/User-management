import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common'; 
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Req() req) {
    const userId = req.user.userId;
    return this.profileService.getProfile(userId);
  }

  @Patch()
  async updateProfile(@Req() req, @Body() body) {
    const userId = req.user.userId;
    return this.profileService.updateProfile(userId, body);
  }
}

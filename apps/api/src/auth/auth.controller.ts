import { Controller, Post, Body, Get, UseGuards, Request, Ip } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any, @Ip() clientIp: string) {
    const ip = body.ip || clientIp || '127.0.0.1';
    return this.authService.login(body.email, body.password, ip);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { token: string; password?: string; ip?: string },
    @Ip() clientIp: string,
  ) {
    const ip = body.ip || clientIp || '127.0.0.1';
    return this.authService.resetPassword(body.token, body.password || '', ip);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('pdpa-consent')
  async recordPdpaConsent(@Request() req: any) {
    return this.authService.recordPdpaConsent(req.user.userId);
  }
}

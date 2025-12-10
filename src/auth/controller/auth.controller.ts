import { Body, Controller, Post, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthLoginInputDto } from '../dto/auth-login-input.dto';
import { AuthRegisterInputDto } from '../dto/auth-register-input.dto';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: AuthRegisterInputDto, @Res({ passthrough: true }) res: Response) {
     const result = await this.authService.register(dto.email, dto.password);

     res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/auth/refresh',
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    };
  }

  @Post('login')
  async login(@Body() dto: AuthLoginInputDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto.email, dto.password);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/auth/refresh',
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: any) {
    const user = req.user;
    const refreshToken = req.cookies['refreshToken'];
    return this.authService.refreshAccessToken(refreshToken, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    await this.authService.logout(user.id);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/auth/refresh',
    });
    
    return { ok: true };
  }
}
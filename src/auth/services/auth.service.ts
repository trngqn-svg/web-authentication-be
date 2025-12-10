import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/services/user.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService{
  constructor(
    private readonly jwtService: JwtService, 
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ){}

  private getAccessToken(user: { id: string; email: string }){
    const payload = { 
      sub: user.id, 
      email: user.email 
    };

    return this.jwtService.sign(payload, { 
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES'),
    });
  }

  private getRefreshToken(user: { id: string; email: string }){
    const payload = { 
      sub: user.id, 
      email: user.email, 
      tokenId: uuidv4() 
    };

    return this.jwtService.sign(payload, { 
      secret: this.configService.get('JWT_REFRESH_SECRET'), 
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES'),
    });
  }

  async register(email: string, password: string) {
    const user = await this.userService.register(email, password);
    const accessToken = this.getAccessToken(user);
    const refreshToken = this.getRefreshToken(user);
    const salt = Number(this.configService.get('BCRYPT_SALT')) || 10;
    const hashed = await bcrypt.hash(refreshToken, salt);

    await this.userService.setRefreshToken(hashed, user.id);
    return { 
      user, 
      accessToken,
      refreshToken,
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES'),
    };
  }

  async login(email: string, password: string) {
    const user = await this.userService.validateUserByPassword(email, password);

    if (!user) throw new BadRequestException('Invalid email or password');

    const accessToken = this.getAccessToken(user);
    const refreshToken = this.getRefreshToken(user);
    const salt = Number(this.configService.get('BCRYPT_SALT')) || 10;
    const hashed = await bcrypt.hash(refreshToken, salt);

    await this.userService.setRefreshToken(hashed, user.id);
    return { 
      user, 
      accessToken,
      refreshToken,
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES'),
    };
  }

  async logout(userId: string) {
    await this.userService.removeRefreshToken(userId);
  }

  async refreshAccessToken(refreshToken: string | undefined, userId: string) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');

    const user = await this.userService.getUserIfRefreshTokenMatches(refreshToken, userId);

    if (!user) throw new UnauthorizedException('Refresh token invalid');

    const accessToken = this.getAccessToken(user);
    return { 
      accessToken,
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES'),
    };
  }
}

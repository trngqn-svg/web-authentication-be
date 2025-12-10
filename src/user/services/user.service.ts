import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService{
  constructor(private readonly repo: UserRepository){}

  async register(email: string, password: string){
    const existing = await this.repo.findByEmail(email);

    if (existing) throw new BadRequestException('User already exists');

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await this.repo.create({ 
      email, 
      password: passwordHash,
    });
    return { id: user._id.toString(), email: user.email };
  }

  async validateUserByPassword(email: string, password: string){
    const user = await this.repo.findByEmail(email);

    if (!user) return null;

    const matches = await bcrypt.compare(password, user.password);

    if (!matches) return null;

    return { id: user._id.toString(), email: user.email };
  }

  async setRefreshToken(hashedToken: string, userId: string) {
    await this.repo.setRefreshToken(hashedToken, userId);
  }

  async removeRefreshToken(userId: string) {
    await this.repo.removeRefreshToken(userId);
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.repo.findById(userId);

    if (!user || !user.refreshToken) return null;

    const match = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!match) return null;
    
    return { id: user._id.toString(), email: user.email };
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppUser } from '../database/entities/app-user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AppUser)
    private userRepository: Repository<AppUser>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['user_roles', 'user_roles.role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'Active') {
      throw new UnauthorizedException('User account is locked or inactive');
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const roles = user.user_roles.map((ur) => ur.role.role_name);
    const role = roles[0] || 'Requester';

    const payload = {
      username: user.username,
      email: user.email,
      sub: user.user_id,
      role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        role,
      },
    };
  }
}

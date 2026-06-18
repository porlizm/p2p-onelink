import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppUser } from '../../database/entities/app-user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(AppUser)
    private userRepository: Repository<AppUser>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'supersecretjwtkey1234567890'),
    });
  }

  async validate(payload: any) {
    const { sub: userId } = payload;
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['user_roles', 'user_roles.role', 'user_roles.role.permissions'],
    });

    if (!user || user.status !== 'Active') {
      throw new UnauthorizedException('User is not active or not found');
    }

    // Extract roles and permissions
    const roles = user.user_roles.map((ur) => ur.role.role_name);
    const role = roles[0] || 'Requester'; // default to first assigned role
    const permissions = user.user_roles.reduce<string[]>((acc, ur) => {
      const permCodes = ur.role.permissions.map((p) => p.permission_code);
      return [...acc, ...permCodes];
    }, []);

    // Get company_id and bu_id from the first role assignment
    const firstRole = user.user_roles[0];
    const companyId = firstRole?.company_id || '';
    const buId = firstRole?.bu_id || '';

    return {
      userId: user.user_id,
      username: user.username,
      email: user.email,
      role,
      roles,
      permissions,
      companyId,
      buId,
    };
  }
}

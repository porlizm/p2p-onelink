import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppUser } from '../database/entities/app-user.entity';
import { AuditLog } from '../database/entities/audit-log.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AppUser)
    private userRepository: Repository<AppUser>,
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string, requestIp?: string) {
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

    // Check IP range
    if (user.allowed_ip_range && requestIp) {
      let normalizedIp = requestIp;
      if (normalizedIp === '::1' || normalizedIp === '::ffff:127.0.0.1') normalizedIp = '127.0.0.1';
      if (normalizedIp.startsWith('::ffff:')) normalizedIp = normalizedIp.replace('::ffff:', '');
      
      if (!this.ipMatches(normalizedIp, user.allowed_ip_range)) {
        throw new UnauthorizedException(`IP Address ${requestIp} is not authorized for this user`);
      }
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
        pdpaConsentDate: user.pdpa_consent_date,
        allowedIpRange: user.allowed_ip_range,
      },
    };
  }

  async recordPdpaConsent(userId: string) {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.pdpa_consent_date = new Date();
    await this.userRepository.save(user);
    return { success: true, pdpaConsentDate: user.pdpa_consent_date };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('ไม่พบอีเมลผู้ใช้งานในระบบ');
    }

    const token = 'reset-' + Math.random().toString(36).substring(2, 15) + '-' + Math.random().toString(36).substring(2, 15);
    user.reset_token = token;
    user.reset_token_expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
    await this.userRepository.save(user);

    // Mock Email Output to Console
    console.log('================================================');
    console.log(`[MOCK EMAIL] To: ${email}`);
    console.log(`[MOCK EMAIL] Subject: รีเซ็ตรหัสผ่านระบบ e-Procurement`);
    console.log(`[MOCK EMAIL] Link: http://localhost:3001/reset-password?token=${token}`);
    console.log('================================================');

    return {
      success: true,
      message: 'ระบบได้ส่งลิงก์กู้คืนรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว (สำหรับจำลอง: ดู Token ในการตอบกลับนี้)',
      token,
    };
  }

  async resetPassword(token: string, pass: string, ipAddress: string) {
    if (!token) {
      throw new BadRequestException('Token ไม่ถูกต้อง');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`-]).{8,}$/;
    if (!passwordRegex.test(pass)) {
      throw new BadRequestException('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร และประกอบด้วยอักษรพิมพ์ใหญ่ (A-Z), อักษรพิมพ์เล็ก (a-z), ตัวเลข (0-9) และอักขระพิเศษอย่างน้อยประเภทละ 1 ตัว');
    }

    const user = await this.userRepository.findOne({
      where: { reset_token: token },
    });

    if (!user) {
      throw new BadRequestException('ลิงก์กู้คืนรหัสผ่านไม่ถูกต้อง หรือเคยใช้ไปแล้ว');
    }

    if (!user.reset_token_expires || user.reset_token_expires.getTime() < Date.now()) {
      throw new BadRequestException('ลิงก์กู้คืนรหัสผ่านหมดอายุแล้ว');
    }

    const beforeValue = { reset_token: token };

    const hash = await bcrypt.hash(pass, 10);
    user.password_hash = hash;
    user.reset_token = null;
    user.reset_token_expires = null;
    await this.userRepository.save(user);

    // Save Audit Log
    const audit = this.auditRepository.create({
      user_id: user.user_id,
      action: 'RESET_PASSWORD',
      entity_type: 'AppUser',
      entity_id: user.user_id,
      before_value_json: beforeValue,
      after_value_json: { ip_address: ipAddress, timestamp: new Date() },
      ip_address: ipAddress,
      timestamp: new Date(),
    });
    await this.auditRepository.save(audit);

    return {
      success: true,
      message: 'รีเซ็ตรหัสผ่านใหม่เรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่',
    };
  }

  private ipMatches(ip: string, cidr: string): boolean {
    if (!cidr) return true;
    if (ip === cidr) return true;
    try {
      const [range, bitsStr] = cidr.split('/');
      if (!bitsStr) return ip === range;
      const bits = parseInt(bitsStr, 10);
      
      const ipParts = ip.split('.').map(Number);
      const rangeParts = range.split('.').map(Number);
      if (ipParts.length !== 4 || rangeParts.length !== 4) return false;
      
      const ipNum = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
      const rangeNum = (rangeParts[0] << 24) + (rangeParts[1] << 16) + (rangeParts[2] << 8) + rangeParts[3];
      
      const mask = ~(2 ** (32 - bits) - 1);
      return (ipNum & mask) === (rangeNum & mask);
    } catch {
      return false;
    }
  }
}

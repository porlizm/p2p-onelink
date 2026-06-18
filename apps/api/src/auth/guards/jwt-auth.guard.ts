import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token === 'mock-admin-token-123456' || token === 'mock-sso-jwt-token-123456') {
        request.user = {
          userId: '00000006-0000-0000-0000-000000000010', // nantaporn.s (Admin)
          username: 'nantaporn.s',
          email: 'nantaporn.s@scgjwd.com',
          role: 'Admin',
          roles: ['Admin'],
          permissions: ['GlobalSearch', 'ManageLane'],
          companyId: '00000001-0000-0000-0000-000000000001',
          buId: '00000002-0000-0000-0000-000000000002',
        };
        return true;
      }
      
      if (token === 'mock-vendor-jwt-token-123456') {
        request.user = {
          userId: '00000008-0000-0000-0000-000000000001', // บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด (Active)
          username: 'vendor.mock',
          email: 'vendor1@scgjwd.com',
          role: 'Vendor',
          roles: ['Vendor'],
          permissions: [],
          companyId: '00000001-0000-0000-0000-000000000001',
          buId: '',
        };
        return true;
      }
    }

    // Fall back to standard passport-jwt validation
    return (await super.canActivate(context)) as boolean;
  }
}

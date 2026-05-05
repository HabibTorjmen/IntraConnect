import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthHelpers } from '../../shared/helpers/auth.helpers';
import { assertPasswordPolicy } from '../../shared/helpers/password-policy.helper';
import { GLOBAL_CONFIG } from '../../configs/global.config';

import {
  AuthResponseDTO,
  FirstLoginDTO,
  LoginUserDTO,
  RegisterUserDTO,
} from './auth.dto';
import { OTP_PURPOSE, OtpService } from './otp.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  private buildToken(userData: any): string {
    const payload = {
      id: userData.id,
      name: userData.username,
      email: userData.email,
      password: null,
      mustChangePassword: userData.mustChangePassword ?? false,
      roles: userData.roles?.map((role) => role.code) ?? [],
      permissions:
        userData.roles?.flatMap((role) =>
          role.permissions.map(
            (permission) => `${permission.module}.${permission.action}`,
          ),
        ) ?? [],
      employeeId: userData.employee?.id,
    };

    return this.jwtService.sign(payload, {
      expiresIn: GLOBAL_CONFIG.security.expiresIn,
    });
  }

  public async login(loginUserDTO: LoginUserDTO): Promise<AuthResponseDTO> {
    const userData = await this.userService.findUser({
      email: loginUserDTO.email,
    });

    if (!userData) {
      throw new UnauthorizedException();
    }

    if (!userData.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (userData.lockedUntil && userData.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        `Account locked until ${userData.lockedUntil.toISOString()}`,
      );
    }

    const isMatch = await AuthHelpers.verify(
      loginUserDTO.password,
      userData.passwordHash,
    );

    if (!isMatch) {
      await this.recordFailedLogin(userData.id, userData.failedLoginAttempts);
      throw new UnauthorizedException();
    }

    if (userData.mustChangePassword) {
      throw new UnauthorizedException(
        'First-login required: use /auth/first-login with the OTP issued by HR',
      );
    }

    if (userData.failedLoginAttempts > 0 || userData.lockedUntil) {
      await this.prisma.user.update({
        where: { id: userData.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    return {
      user: userData,
      accessToken: this.buildToken(userData),
    };
  }

  private async recordFailedLogin(userId: string, currentCount: number): Promise<void> {
    const lockout = GLOBAL_CONFIG.security.lockout;
    const next = currentCount + 1;
    const shouldLock = next >= lockout.maxFailedAttempts;
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: next,
        lockedUntil: shouldLock
          ? new Date(Date.now() + lockout.lockoutMinutes * 60 * 1000)
          : null,
      },
    });
  }

  public async firstLogin(dto: FirstLoginDTO): Promise<AuthResponseDTO> {
    const userData = await this.userService.findUser({ email: dto.email });
    if (!userData || !userData.isActive) {
      throw new UnauthorizedException();
    }

    const consumed = await this.otpService.consume(
      userData.id,
      dto.otp,
      OTP_PURPOSE.FIRST_LOGIN,
    );

    if (!consumed) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    assertPasswordPolicy(dto.newPassword);

    const passwordHash = await AuthHelpers.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userData.id },
      data: {
        passwordHash,
        mustChangePassword: false,
        passwordChangedAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    const refreshed = await this.userService.findUser({ id: userData.id });

    return {
      user: refreshed,
      accessToken: this.buildToken(refreshed),
    };
  }

  public async regenerateOtp(userId: string): Promise<{ otp: string; expiresAt: Date }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    if (!user.isActive) {
      throw new BadRequestException('Cannot regenerate OTP for deactivated user');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { mustChangePassword: true },
    });
    return this.otpService.issue(userId, OTP_PURPOSE.FIRST_LOGIN);
  }

  public async register(user: RegisterUserDTO): Promise<User> {
    assertPasswordPolicy(user.password);
    const hashedPassword = await AuthHelpers.hash(user.password);
    const employeeRole = await this.prisma.role.findUnique({
      where: { code: 'employee' },
    });

    return this.userService.createUser({
      username: user.name, // map name → username
      email: user.email,
      passwordHash: hashedPassword,
      roles: employeeRole
        ? {
            connect: {
              id: employeeRole.id,
            },
          }
        : undefined,
    });
  }
}

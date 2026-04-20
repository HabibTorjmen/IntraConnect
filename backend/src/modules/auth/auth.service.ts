import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthHelpers } from '../../shared/helpers/auth.helpers';
import { GLOBAL_CONFIG } from '../../configs/global.config';

import { AuthResponseDTO, LoginUserDTO, RegisterUserDTO } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  public async login(loginUserDTO: LoginUserDTO): Promise<AuthResponseDTO> {
    const userData = await this.userService.findUser({
      email: loginUserDTO.email,
    });

    if (!userData) {
      throw new UnauthorizedException();
    }

    const isMatch = await AuthHelpers.verify(
      loginUserDTO.password,
      userData.passwordHash,
    );

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = {
      id: userData.id,
      name: userData.username,
      email: userData.email,
      password: null,
      // role: userData.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: GLOBAL_CONFIG.security.expiresIn,
    });

    return {
      user: userData,
      accessToken: accessToken,
    };
  }
 public async register(user: RegisterUserDTO): Promise<User> {
    
    const hashedPassword = await AuthHelpers.hash(user.password);

    return this.userService.createUser({
      username: user.name, // map name → username
      email: user.email,
      passwordHash: hashedPassword,
    });
  }
}

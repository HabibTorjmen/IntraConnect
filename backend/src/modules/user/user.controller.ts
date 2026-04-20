import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { AuthHelpers } from '../../shared/helpers/auth.helpers';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(): Promise<User[]> {
    return this.userService.users({});
  }

  @Post('user')
  async signupUser(
    @Body() userData: { name: string; email: string; password: string },
  ): Promise<User> {
    const hashedPassword = await AuthHelpers.hash(userData.password);
    return this.userService.createUser({
      username: userData.name,
      email: userData.email,
      passwordHash: hashedPassword,
    });
  }
}

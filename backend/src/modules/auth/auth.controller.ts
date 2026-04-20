import { Body, Controller, Get, Post, Response, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { JWT_EXPIRY_SECONDS } from '../../shared/constants/global.constants';

import { AuthService } from './auth.service';
import { AuthResponseDTO, LoginUserDTO, RegisterUserDTO } from './auth.dto';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from './auth.jwt.guard';
import { AuthUser } from './auth.user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) {}

  @Post('login')
  @ApiOperation({ description: 'Login user' })
  @ApiBody({ type: LoginUserDTO })
  @ApiResponse({ type: AuthResponseDTO })
  async login(
    @Body() user: LoginUserDTO,
    @Response() res,
  ): Promise<AuthResponseDTO> {
    const loginData = await this.authService.login(user);

    res.cookie('accessToken', loginData.accessToken, {
      expires: new Date(new Date().getTime() + JWT_EXPIRY_SECONDS * 1000),
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
    });

    await this.auditService.log('User logged in', loginData.user.id);

    return res.status(200).send(loginData);
  }

  @Post('register')
  async register(@Body() user: RegisterUserDTO): Promise<User> {
    const newUser = await this.authService.register(user);
    await this.auditService.log('User registered', newUser.id);
    return newUser;
  }

  @Post('logout')
  logout(@Response() res): void {
    res.clearCookie('accessToken');
    res.status(200).send({ success: true });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'Get current user profile' })
  async getMe(@AuthUser() user: User): Promise<User> {
    return user;
  }
}

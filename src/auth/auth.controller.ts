// auth.controller.ts
import { Controller, Post, Body, Patch, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { JwtAuthGuard } from './jwt-auth.guard';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserId } from './decorators/user-id.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) { }

  @Post('login')
  @ApiOperation({ summary: 'Login com email e senha' })
  @ApiResponse({ status: 201, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() dto: LoginDto): Promise<StandardResponse> {
    const result = await this.authService.login(dto.email, dto.password);

    const responseMessage: ResponseMessageEnum = result.mustChangePassword
      ? ResponseMessageEnum.PASSWORD_CHANGE_REQUIRED
      : ResponseMessageEnum.LOGIN_SUCCESS;

    return { data: result, message: responseMessage };
  }

  @Patch('reset-password')
  @ApiOperation({ summary: 'Trocar senha após receber o código' })
  async changePassword(@Req() req: any, @Body() dto: ResetPasswordDto): Promise<StandardResponse> {
    await this.authService.resetPasswordWithCode(dto)

    return {
      data: null,
      message: ResponseMessageEnum.PASSWORD_CHANGED_SUCCESSFULLY
    }
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trocar senha após autenticado' })
  async resetPassword(@UserId() userId: string, @Body() dto: ChangePasswordDto): Promise<StandardResponse> {
    await this.authService.changePassword(userId, dto)

    return {
      data: null,
      message: ResponseMessageEnum.PASSWORD_CHANGED_SUCCESSFULLY
    }
  }
}

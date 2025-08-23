// auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

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
}

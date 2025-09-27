// auth.controller.ts
import { Controller, Post, Body, Patch, UseGuards, Req, UnauthorizedException, Delete, Headers, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserId } from './decorators/user-id.decorator';
import { ValidateInviteDto } from './dto/validate-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { RequestReaderCodeDto } from './dto/request-reader-code.dto';
import { SignupReaderDto } from './dto/signup-reader.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
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

  @Delete('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout do usuário (invalida o token atual)' })
  async logout(@Req() req: Request): Promise<StandardResponse> {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) throw new UnauthorizedException('Token não encontrado no header Authorization');

    await this.authService.logout(token);
    return {
      message: ResponseMessageEnum.LOGOUT_SUCCESSFULLY,
      data: null
    };
  }

  @Get('invite/validate')
  @ApiOperation({ summary: 'Valida token de convite' })
  @ApiQuery({ name: 'invitationToken', type: String, required: true, description: 'Token de convite enviado por e-mail' })
  async validateInvite(@Query() query: ValidateInviteDto): Promise<StandardResponse> {
    const data = await this.authService.validateInviteToken(query.invitationToken);
    return {
      message: ResponseMessageEnum.INVITE_TOKEN_VALID,
      data,
    };
  }

  @Post('invite/accept')
  @ApiOperation({ summary: 'Aceita convite e cria conta' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Token inválido ou senhas não conferem' })
  async acceptInvite(@Body() dto: AcceptInviteDto): Promise<StandardResponse> {
    const result = await this.authService.acceptInvite(dto);
    return {
      message: ResponseMessageEnum.USER_CREATED,
      data: result,
    };
  }

  @Post('reader/request-code')
  @ApiOperation({ summary: 'Solicita código de verificação para novo leitor' })
  async requestReaderCode(@Body() dto: RequestReaderCodeDto): Promise<StandardResponse> {
    await this.authService.sendReaderSignupCode(dto.email);
    return {
      data: null,
      message: ResponseMessageEnum.SIGNUP_CODE_SENT_SUCCESSFULLY
    }
  }

  @Post('reader/signup')
  @ApiOperation({ summary: 'Cria conta de leitor com código validado' })
  async signupReader(@Body() dto: SignupReaderDto): Promise<StandardResponse> {
    const result = await this.authService.signupReader(dto);

    return {
      data: result,
      message: ResponseMessageEnum.SIGNUP_SUCCESSFULLY
    }
  }
}

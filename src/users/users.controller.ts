// src/users/users.controller.ts
import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Retorna o usuário autenticado' })
  async getMe(@Req() req: any) {
    return this.usersService.findByEmail(req.user.email);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trocar senha após login obrigatório' })
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    const user = await this.usersService.findByEmail(req.user.email);

    const valid = await bcrypt.compare(dto.oldPassword, user.password);
    if (!valid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);

    return this.usersService.updatePassword(user.id, hashed);
  }
}

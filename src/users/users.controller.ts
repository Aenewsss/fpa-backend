// src/users/users.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { InviteUserDto } from './dto/invite-user.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/auth/decorators/user-role.decorator';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  @ApiOperation({ summary: 'Retorna o usuário autenticado' })
  async getMe(@Req() req: any) {
    return this.usersService.findByEmail(req.user.email);
  }

  @Post('invite')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MAIN_EDITOR)
  async inviteUser(@Body() dto: InviteUserDto, @UserRole() userRole: UserRoleEnum): Promise<StandardResponse> {
    await this.usersService.inviteUser(dto, userRole);
    return {
      data: null,
      message: ResponseMessageEnum.USER_INVITED_SUCCESSFULLY
    }
  }
}

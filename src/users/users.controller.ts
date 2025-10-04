// src/users/users.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { InviteUserDto } from './dto/invite-user.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/auth/decorators/user-role.decorator';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  // user.controller.ts
  @Post('resend-invite/:userId')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MAIN_EDITOR)
  async resendInvite(
    @Param('userId') userId: string,
    @UserRole() userRole: UserRoleEnum
  ): Promise<StandardResponse> {
    await this.usersService.resendInvite(userId, userRole);
    return {
      data: null,
      message: ResponseMessageEnum.USER_INVITE_RESENT_SUCCESSFULLY
    }
  }

  @Delete(':id')
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: 'Deleta um usuário (soft delete)' })
  async softDeleteUser(@Param('id') id: string): Promise<StandardResponse> {
    const result = await this.usersService.softDeleteUser(id);
    return {
      data: result,
      message: ResponseMessageEnum.USER_DELETED_SUCCESSFULLY,
    };
  }

  @Get()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MAIN_EDITOR)
  @ApiOperation({ summary: 'List users with pagination and optional search' })
  async listUsers(@Query() query: PaginationQueryDto): Promise<StandardResponse> {
    const result = await this.usersService.listUsers(query);
    return {
      data: result,
      message: ResponseMessageEnum.LIST_USERS_SUCCESSFULLY,
    };
  }

  @Get('/invited')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MAIN_EDITOR)
  @ApiOperation({ summary: 'List users invited with pagination and optional search' })
  async listUsersInvited(@Query() query: PaginationQueryDto): Promise<StandardResponse> {
    const result = await this.usersService.listUsersInvited(query);
    return {
      data: result,
      message: ResponseMessageEnum.LIST_USERS_SUCCESSFULLY,
    };
  }

  @Patch(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MAIN_EDITOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Update user details (email, firstName, lastName, role)',
    examples: {
      update: {
        summary: 'Example payload',
        value: {
          email: 'user@fpa.org.br',
          firstName: 'Maria',
          lastName: 'Souza',
          role: 'EDITOR',
        },
      },
    },
  })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<StandardResponse> {
    const result = await this.usersService.updateUser(id, dto);
    return {
      data: result,
      message: ResponseMessageEnum.USER_UPDATED_SUCCESSFULLY,
    };
  }
}

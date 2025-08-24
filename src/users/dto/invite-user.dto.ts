// src/users/dto/invite-user.dto.ts
import { IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRoleEnum } from 'src/common/enums/role.enum';

export class InviteUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: UserRoleEnum, enumName: 'UserRole', example: UserRoleEnum.MAIN_EDITOR })
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum; // Apenas MAIN_EDITOR ou EDITOR
}
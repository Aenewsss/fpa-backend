// src/users/dto/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'changeme123' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'novasenhasegura123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

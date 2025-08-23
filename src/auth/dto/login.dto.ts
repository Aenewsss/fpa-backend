// src/auth/dto/login.dto.ts
import { IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@admin.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'changeme123', minLength: 6 })
  @MinLength(6)
  password: string;
}

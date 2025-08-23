// src/auth/dto/reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'E-mail do usuário que recebeu o código',
    example: 'usuario@exemplo.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Código recebido por e-mail',
    example: '872910',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Nova senha (mín. 6 dígitos, com maiúscula, minúscula, número e caractere especial)',
    example: 'NovaSenha@123',
  })
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/,
    {
      message:
        'A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número, um caractere especial e no mínimo 6 dígitos.',
    },
  )
  newPassword: string;

  @ApiProperty({
    description: 'Confirmação da nova senha (deve ser idêntica)',
    example: 'NovaSenha@123',
  })
  @IsString()
  repeatNewPassword: string;
}
import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptInviteDto {
  @ApiProperty({
    description: 'Token de convite enviado por e-mail',
    example: 'a3b27cfa-3c1a-4a92-81e4-9df1f93ccf72',
  })
  @IsString()
  invitationToken: string;

  @ApiProperty({
    description: 'Primeiro nome do usuário convidado',
    example: 'João',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Sobrenome do usuário convidado',
    example: 'Silva',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description:
      'Nova senha (mínimo 6 caracteres, com letra maiúscula, minúscula, número e caractere especial)',
    example: 'Senha@123',
  })
  @IsString()
  @MinLength(6)
  @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_])/, {
    message:
      'A senha deve conter maiúscula, minúscula, número e caractere especial',
  })
  password: string;

  @ApiProperty({
    description: 'Confirmação da nova senha',
    example: 'Senha@123',
  })
  @IsString()
  repeatPassword: string;
}
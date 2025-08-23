// auth.service.ts
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RedisService } from 'src/redis/redis.service';
import { MailService } from 'src/mail/mail.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private mailService: MailService,
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    if (user.mustChangePassword) {
      const code = Math.floor(100000 + Math.random() * 900000).toString(); // ex: 834921
      await this.redisService.setCode(email, code);
      await this.mailService.sendPasswordResetCode(email, code);
    }

    const payload = { sub: user.id, role: user.role, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
      mustChangePassword: user.mustChangePassword,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async resetPasswordWithCode(dto: ChangePasswordDto): Promise<void> {
    const { email, code, newPassword, repeatNewPassword } = dto;

    if (newPassword !== repeatNewPassword) {
      throw new BadRequestException(ResponseMessageEnum.PASSWORD_CONFIRMATION_MISMATCH);
    }

    // Verifica se o código bate com o armazenado no Redis
    const storedCode = await this.redisService.getCode(email);
    if (!storedCode || storedCode !== code) {
      throw new BadRequestException(ResponseMessageEnum.INVALID_OR_EXPIRED_CODE);
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(ResponseMessageEnum.USER_NOT_FOUND);
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.usersService.updatePassword(user.id, hashed);
    await this.redisService.deleteCode(email);
  }
}

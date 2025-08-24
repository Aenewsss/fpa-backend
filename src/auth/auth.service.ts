// auth.service.ts
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RedisService } from 'src/redis/redis.service';
import { MailService } from 'src/mail/mail.service';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as jwt from 'jsonwebtoken';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRoleEnum } from 'src/common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private mailService: MailService,
    private prisma: PrismaService,
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
      access_token: this.jwtService.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: '1h' }),
      mustChangePassword: user.mustChangePassword,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async resetPasswordWithCode(dto: ResetPasswordDto): Promise<void> {
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

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const { newPassword, repeatNewPassword } = dto;

    if (newPassword !== repeatNewPassword) {
      throw new BadRequestException(ResponseMessageEnum.PASSWORD_CONFIRMATION_MISMATCH);
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(ResponseMessageEnum.USER_NOT_FOUND);
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.usersService.updatePassword(user.id, hashed);
  }

  async logout(token: string) {
    const decoded: any = jwt.decode(token);
    const exp = decoded?.exp;
    if (!exp) return;

    const now = Math.floor(Date.now() / 1000);
    const ttl = exp - now;
    if (ttl > 0) {
      await this.redisService.blacklistToken(token, ttl);
    }
  }

  async validateInviteToken(invitationToken: string) {
    const invite = await this.checkInvitationToken(invitationToken)

    return {
      email: invite.email,
      role: invite.role,
    };
  }

  async acceptInvite(dto: AcceptInviteDto) {
    const { invitationToken, password, repeatPassword, firstName, lastName } = dto;

    if (password !== repeatPassword) throw new BadRequestException(ResponseMessageEnum.PASSWORD_CONFIRMATION_MISMATCH);

    const userInvited = await this.checkInvitationToken(invitationToken)

    const existingUser = await this.usersService.findByEmail(userInvited.email);
    if (existingUser) throw new BadRequestException(ResponseMessageEnum.USER_ALREADY_EXISTS);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.createUserFromInvite({
      email: userInvited.email,
      password: hashedPassword,
      role: userInvited.role as UserRoleEnum,
      firstName,
      lastName,
    });

    await this.prisma.userInvited.update({
      where: { invitationToken },
      data: {
        used: true,
        status: 'accepted',
        acceptedAt: new Date()
      },
    });

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }

  private async checkInvitationToken(invitationToken: string) {
    const invite = await this.prisma.userInvited.findUnique({
      where: {
        invitationToken,
      },
    });

    if (!invite || invite.expiresAt < new Date()) throw new BadRequestException(ResponseMessageEnum.INVALID_OR_EXPIRED_INVITATION_TOKEN);
    if (invite.used || invite.status === 'accepted') throw new BadRequestException(ResponseMessageEnum.INVITE_ALREADY_USED);

    return invite
  }
}

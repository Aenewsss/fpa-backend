// src/users/users.service.ts
import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { MailService } from 'src/mail/mail.service';
import { RedisService } from 'src/redis/redis.service';
import { randomUUID } from 'crypto';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { CreateUserFromInviteInput } from './input/create-user-invite.input';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) { }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });
  }

  async inviteUser(dto: InviteUserDto, currentUserRole: UserRoleEnum) {
    const { email, role } = dto;

    if (role === UserRoleEnum.ADMIN)
      throw new ForbiddenException(ResponseMessageEnum.ADMIN_CANNOT_BE_INVITED);

    if (currentUserRole === UserRoleEnum.MAIN_EDITOR && role !== UserRoleEnum.EDITOR)
      throw new ForbiddenException(ResponseMessageEnum.MAIN_EDITOR_CAN_ONLY_INVITE_EDITOR);

    const userExists = await this.prisma.user.findUnique({ where: { email } });
    if (userExists) throw new ConflictException(ResponseMessageEnum.USER_ALREADY_EXISTS);

    const alreadyInvited = await this.prisma.userInvited.findUnique({ where: { email, used: false, status: 'pending' } });
    if (alreadyInvited && !alreadyInvited.used) throw new ConflictException(ResponseMessageEnum.USER_ALREADY_INVITED);

    const invitationToken = randomUUID();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour

    await this.prisma.userInvited.create({
      data: {
        email,
        invitationToken,
        status: 'pending',
        expiresAt,
        role
      },
    });

    const url = `${process.env.INVITE_ACCEPT_URL}?email=${encodeURIComponent(email)}&invitationToken=${invitationToken}`;
    await this.mailService.sendInvite(email, url);
  }

  async createUserFromInvite(input: CreateUserFromInviteInput) {
    const { email, password, role, firstName, lastName } = input;

    return this.prisma.user.create({
      data: {
        email,
        password,
        role,
        mustChangePassword: false,
        firstName,
        lastName
      },
    });
  }
}

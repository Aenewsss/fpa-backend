// src/users/users.service.ts
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { MailService } from 'src/mail/mail.service';
import { RedisService } from 'src/redis/redis.service';
import { randomUUID } from 'crypto';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { CreateUserInput } from './input/create-user-invite.input';
import { Prisma, Role } from '@prisma/client';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

    if (currentUserRole != UserRoleEnum.ADMIN && role === UserRoleEnum.ADMIN)
      throw new ForbiddenException(ResponseMessageEnum.ADMIN_CANNOT_BE_INVITED);

    if (currentUserRole === UserRoleEnum.MAIN_EDITOR && role !== UserRoleEnum.EDITOR)
      throw new ForbiddenException(ResponseMessageEnum.MAIN_EDITOR_CAN_ONLY_INVITE_EDITOR);

    const userExists = await this.prisma.user.findUnique({ where: { email } });
    if (userExists) throw new ConflictException(ResponseMessageEnum.USER_ALREADY_EXISTS);

    const alreadyInvited = await this.prisma.userInvited.findFirst({ where: { email, used: false, status: 'pending' } });
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
        role: role as Role
      },
    });

    const url = `${process.env.INVITE_ACCEPT_URL}?email=${encodeURIComponent(email)}&invitationToken=${invitationToken}`;
    await this.mailService.sendInvite(email, url);
  }

  async resendInvite(userId: string, currentUserRole: UserRoleEnum) {
    // Não deixar ADMIN convidar outro ADMIN
    const invitedUser = await this.prisma.userInvited.findFirst({
      where: { id: userId, status: 'pending', used: false },
    });

    if (!invitedUser) {
      throw new NotFoundException(ResponseMessageEnum.INVITE_NOT_FOUND);
    }

    // Verificações de regra de quem pode reenviar
    if (currentUserRole !== UserRoleEnum.ADMIN && invitedUser.role === UserRoleEnum.ADMIN) {
      throw new ForbiddenException(ResponseMessageEnum.ADMIN_CANNOT_BE_INVITED);
    }

    if (currentUserRole === UserRoleEnum.MAIN_EDITOR && invitedUser.role !== UserRoleEnum.EDITOR) {
      throw new ForbiddenException(ResponseMessageEnum.MAIN_EDITOR_CAN_ONLY_INVITE_EDITOR);
    }

    // expires all previous invites
    await this.prisma.userInvited.updateMany({
      where: { status: 'pending', email: invitedUser.email },
      data: { expiresAt: new Date(), status: 'expired' },
    })

    // gera um novo token e nova expiração
    const invitationToken = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // +1h

    await this.prisma.userInvited.create({
      data: {
        email: invitedUser.email,
        invitationToken,
        expiresAt,
        role: invitedUser.role,
        status: 'pending',
        used: false,
      }
    });

    const url = `${process.env.INVITE_ACCEPT_URL}?email=${encodeURIComponent(invitedUser.email)}&invitationToken=${invitationToken}`;
    await this.mailService.sendInvite(invitedUser.email, url);
  }

  async createUser(input: CreateUserInput) {
    const { jobRole, email, password, role, firstName, lastName } = input;

    return this.prisma.user.create({
      data: {
        email,
        password,
        role: role as Role,
        mustChangePassword: false,
        firstName,
        lastName,
        jobRole
      },
    });
  }

  async softDeleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.removed) throw new NotFoundException(ResponseMessageEnum.USER_NOT_FOUND);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        removed: true,
      },
    });
  }

  async listUsers(query: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = query;

    const where: Prisma.UserWhereInput = {
      removed: false,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      total,
      page,
      limit,
      users,
    };
  }

  async listUsersInvited(query: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = query;

    const where: Prisma.UserInvitedWhereInput = {
      ...(search && {
        email: { contains: search, mode: 'insensitive' }
      }),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.userInvited.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { invitedAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
        },
      }),
      this.prisma.userInvited.count({ where }),
    ]);

    return {
      total,
      page,
      limit,
      users,
    };
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return await this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }
}

// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updatePassword(userId: string, newPassword: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: newPassword,
        mustChangePassword: false,
      },
    });
  }
}

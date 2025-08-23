// src/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: Partial<PrismaService>;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-id',
          email: 'admin@admin.com',
          name: 'Admin',
          password: 'hashed',
          role: 'ADMIN',
          mustChangePassword: true,
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should return user by email', async () => {
    const user = await service.findByEmail('admin@admin.com');
    expect(user).toBeDefined();
    expect(user?.email).toBe('admin@admin.com');
  });
});

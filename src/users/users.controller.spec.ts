// src/users/users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: Partial<UsersService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn().mockResolvedValue({
        id: 'user-id',
        name: 'Admin',
        email: 'admin@admin.com',
        role: 'ADMIN',
        mustChangePassword: true,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should return user data from getMe()', async () => {
    const req = { user: { email: 'admin@admin.com' } };
    const result = await controller.getMe(req as any);
    expect(result).toBeDefined();
    expect(result.email).toBe('admin@admin.com');
  });
});

// src/auth/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: Partial<AuthService>;

  beforeEach(async () => {
    service = {
      login: jest.fn().mockResolvedValue({
        access_token: 'mock-jwt-token',
        mustChangePassword: true,
        user: {
          id: '123',
          name: 'Admin',
          email: 'admin@admin.com',
          role: 'ADMIN',
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should return token and user info on login', async () => {
    const dto: LoginDto = {
      email: 'admin@admin.com',
      password: 'changeme123',
    };

    const result = await controller.login(dto);
    expect(result).toHaveProperty('access_token');
    expect(result.user.email).toBe('admin@admin.com');
  });
});

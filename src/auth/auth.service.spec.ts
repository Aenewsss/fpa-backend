// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  const mockUser = {
    id: 'user-id',
    name: 'Admin',
    email: 'admin@admin.com',
    password: bcrypt.hash('changeme123', 10),
    role: 'ADMIN',
    mustChangePassword: true,
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn().mockResolvedValue(mockUser),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should validate user credentials', async () => {
    const user = await service.validateUser('admin@admin.com', 'changeme123');
    expect(user).toHaveProperty('id');
    expect(user.email).toBe('admin@admin.com');
  });

  it('should throw on invalid password', async () => {
    await expect(service.validateUser('admin@admin.com', 'wrong-password')).rejects.toThrow();
  });

  it('should return access token and user on login', async () => {
    const result = await service.login('admin@admin.com', 'changeme123');
    expect(result.access_token).toBe('mock-jwt-token');
    expect(result.mustChangePassword).toBe(true);
    expect(result.user.email).toBe('admin@admin.com');
  });
});

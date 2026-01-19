import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let prismaService: PrismaService;
    let jwtService: JwtService;

    const mockUser = {
        id: 'user-123',
        email: 'admin@pingintrip.com',
        password: 'hashedPassword123',
        name: 'Admin User',
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
        },
    };

    const mockJwtService = {
        signAsync: jest.fn(),
        verify: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            const config: Record<string, string> = {
                JWT_SECRET: 'test-secret',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
                JWT_EXPIRES_IN: '900',
                JWT_REFRESH_EXPIRES_IN: '604800',
            };
            return config[key];
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prismaService = module.get<PrismaService>(PrismaService);
        jwtService = module.get<JwtService>(JwtService);

        // Reset all mocks
        jest.clearAllMocks();
    });

    describe('login', () => {
        const loginDto = { email: 'admin@pingintrip.com', password: 'password123' };

        it('should successfully login with valid credentials', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.signAsync
                .mockResolvedValueOnce('access-token')
                .mockResolvedValueOnce('refresh-token');

            // Act
            const result = await service.login(loginDto);

            // Assert
            expect(result.user.email).toBe(mockUser.email);
            expect(result.user.name).toBe(mockUser.name);
            expect(result.accessToken).toBe('access-token');
            expect(result.refreshToken).toBe('refresh-token');
            expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
                where: { email: loginDto.email },
            });
        });

        it('should throw UnauthorizedException for non-existent user', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
        });

        it('should throw UnauthorizedException for deactivated user', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue({
                ...mockUser,
                isActive: false,
            });

            // Act & Assert
            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            await expect(service.login(loginDto)).rejects.toThrow('Account is deactivated');
        });

        it('should throw UnauthorizedException for invalid password', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            // Act & Assert
            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
        });
    });

    describe('refreshToken', () => {
        it('should successfully refresh tokens with valid refresh token', async () => {
            // Arrange
            mockJwtService.verify.mockReturnValue({ sub: mockUser.id });
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockJwtService.signAsync
                .mockResolvedValueOnce('new-access-token')
                .mockResolvedValueOnce('new-refresh-token');

            // Act
            const result = await service.refreshToken('valid-refresh-token');

            // Assert
            expect(result.user.id).toBe(mockUser.id);
            expect(result.accessToken).toBe('new-access-token');
            expect(result.refreshToken).toBe('new-refresh-token');
        });

        it('should throw UnauthorizedException for invalid refresh token', async () => {
            // Arrange
            mockJwtService.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            // Act & Assert
            await expect(service.refreshToken('invalid-token')).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should throw UnauthorizedException for deactivated user', async () => {
            // Arrange
            mockJwtService.verify.mockReturnValue({ sub: mockUser.id });
            mockPrismaService.user.findUnique.mockResolvedValue({
                ...mockUser,
                isActive: false,
            });

            // Act & Assert
            await expect(service.refreshToken('valid-token')).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    describe('validateUser', () => {
        it('should return user for valid active user', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            // Act
            const result = await service.validateUser(mockUser.id);

            // Assert
            expect(result).toBeTruthy();
            expect(result?.id).toBe(mockUser.id);
        });

        it('should return null for non-existent user', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            // Act
            const result = await service.validateUser('non-existent-id');

            // Assert
            expect(result).toBeNull();
        });

        it('should return null for deactivated user', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue({
                ...mockUser,
                isActive: false,
            });

            // Act
            const result = await service.validateUser(mockUser.id);

            // Assert
            expect(result).toBeNull();
        });
    });
});

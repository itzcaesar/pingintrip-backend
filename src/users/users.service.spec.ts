import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt');

describe('UsersService', () => {
    let service: UsersService;

    const mockUser = {
        id: 'user-123',
        email: 'test@pingintrip.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'STAFF',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockPrismaService = {
        user: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        const createDto = {
            email: 'new@pingintrip.com',
            password: 'password123',
            name: 'New User',
            role: 'STAFF' as const,
        };

        it('should create a user successfully', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            mockPrismaService.user.create.mockResolvedValue(mockUser);

            // Act
            const result = await service.create(createDto);

            // Assert
            expect(result.email).toBeDefined();
            expect(result).not.toHaveProperty('password');
            expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 10);
        });

        it('should throw ConflictException for duplicate email', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            // Act & Assert
            await expect(service.create(createDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return paginated users without passwords', async () => {
            // Arrange
            const { password, ...userWithoutPassword } = mockUser;
            mockPrismaService.user.findMany.mockResolvedValue([userWithoutPassword]);
            mockPrismaService.user.count.mockResolvedValue(1);

            // Act
            const result = await service.findAll({ page: 1, limit: 10 });

            // Assert
            expect(result.data).toHaveLength(1);
            expect(result.meta.total).toBe(1);
        });
    });

    describe('findOne', () => {
        it('should return a user by id', async () => {
            // Arrange
            const { password, ...userWithoutPassword } = mockUser;
            mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);

            // Act
            const result = await service.findOne('user-123');

            // Assert
            expect(result.id).toBe('user-123');
        });

        it('should throw NotFoundException for non-existent user', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a user successfully', async () => {
            // Arrange
            const { password, ...userWithoutPassword } = mockUser;
            mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);
            mockPrismaService.user.findFirst.mockResolvedValue(null);
            mockPrismaService.user.update.mockResolvedValue({
                ...userWithoutPassword,
                name: 'Updated Name',
            });

            // Act
            const result = await service.update('user-123', { name: 'Updated Name' });

            // Assert
            expect(result.name).toBe('Updated Name');
        });

        it('should hash password when updating', async () => {
            // Arrange
            const { password, ...userWithoutPassword } = mockUser;
            mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);
            (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
            mockPrismaService.user.update.mockResolvedValue(userWithoutPassword);

            // Act
            await service.update('user-123', { password: 'newPassword' });

            // Assert
            expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
        });

        it('should throw ConflictException for duplicate email on update', async () => {
            // Arrange
            const { password, ...userWithoutPassword } = mockUser;
            mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);
            mockPrismaService.user.findFirst.mockResolvedValue({
                ...mockUser,
                id: 'other-user',
            });

            // Act & Assert
            await expect(
                service.update('user-123', { email: 'existing@email.com' }),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('remove', () => {
        it('should deactivate a user', async () => {
            // Arrange
            const { password, ...userWithoutPassword } = mockUser;
            mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);
            mockPrismaService.user.update.mockResolvedValue({
                ...userWithoutPassword,
                isActive: false,
            });

            // Act & Assert
            await expect(service.remove('user-123')).resolves.not.toThrow();
        });
    });

    describe('activate', () => {
        it('should activate a user', async () => {
            // Arrange
            const { password, ...userWithoutPassword } = mockUser;
            mockPrismaService.user.findUnique.mockResolvedValue({
                ...userWithoutPassword,
                isActive: false,
            });
            mockPrismaService.user.update.mockResolvedValue({
                ...userWithoutPassword,
                isActive: true,
            });

            // Act
            const result = await service.activate('user-123');

            // Assert
            expect(result.isActive).toBe(true);
        });
    });
});

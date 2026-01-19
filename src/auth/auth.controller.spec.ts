import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        login: jest.fn(),
        refreshToken: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{ provide: AuthService, useValue: mockAuthService }],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);

        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should call authService.login with correct dto', async () => {
            // Arrange
            const loginDto = { email: 'test@test.com', password: 'password123' };
            const expectedResult = {
                user: { id: '1', email: 'test@test.com', name: 'Test', role: 'ADMIN' },
                accessToken: 'token',
                refreshToken: 'refresh',
            };
            mockAuthService.login.mockResolvedValue(expectedResult);

            // Act
            const result = await controller.login(loginDto);

            // Assert
            expect(authService.login).toHaveBeenCalledWith(loginDto);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('refresh', () => {
        it('should call authService.refreshToken with correct token', async () => {
            // Arrange
            const refreshDto = { refreshToken: 'valid-refresh-token' };
            const expectedResult = {
                user: { id: '1', email: 'test@test.com', name: 'Test', role: 'ADMIN' },
                accessToken: 'new-token',
                refreshToken: 'new-refresh',
            };
            mockAuthService.refreshToken.mockResolvedValue(expectedResult);

            // Act
            const result = await controller.refresh(refreshDto);

            // Assert
            expect(authService.refreshToken).toHaveBeenCalledWith(refreshDto.refreshToken);
            expect(result).toEqual(expectedResult);
        });
    });
});

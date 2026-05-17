import { authService } from '@/services/auth.service';
import api from '@/services/api';
import axios from 'axios';

jest.mock('@/services/api', () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
    },
}));

jest.mock('axios', () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
    },
}));

const mockApi = api as unknown as { post: jest.Mock };
const mockAxios = axios as unknown as { post: jest.Mock };

beforeEach(() => {
    jest.clearAllMocks();
});

describe('authService', () => {
    describe('login', () => {
        it('wysyła email i hasło na /auth/login i zwraca tokeny', async () => {
            const response = { accessToken: 'a', refreshToken: 'r', twoFactorRequired: false };
            mockApi.post.mockResolvedValue({ data: response });

            const result = await authService.login({ email: 'a@b.c', password: 'pass' });

            expect(mockApi.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.c', password: 'pass' });
            expect(result).toEqual(response);
        });

        it('zwraca twoFactorRequired=true gdy konto ma 2FA', async () => {
            const response = { accessToken: 'challenge', refreshToken: null, twoFactorRequired: true };
            mockApi.post.mockResolvedValue({ data: response });

            const result = await authService.login({ email: 'a@b.c', password: 'pass' });

            expect(result.twoFactorRequired).toBe(true);
            expect(result.refreshToken).toBeNull();
        });
    });

    describe('verify2FA', () => {
        it('używa raw axios (nie api) z explicit Bearer token dla challenge JWT', async () => {
            const response = { accessToken: 'real', refreshToken: 'uuid-refresh', twoFactorRequired: false };
            mockAxios.post.mockResolvedValue({ data: response });

            const result = await authService.verify2FA('123456', 'challenge-token');

            expect(mockAxios.post).toHaveBeenCalledTimes(1);
            expect(mockApi.post).not.toHaveBeenCalled();
            expect(mockAxios.post).toHaveBeenCalledWith(
                expect.stringContaining('/auth/2fa/verify'),
                { code: '123456' },
                { headers: { Authorization: 'Bearer challenge-token' } }
            );
            expect(result).toEqual(response);
        });

        it('przekazuje kod TOTP w body jako { code }', async () => {
            mockAxios.post.mockResolvedValue({ data: { accessToken: 'a', refreshToken: 'r', twoFactorRequired: false } });

            await authService.verify2FA('987654', 'token');

            expect(mockAxios.post).toHaveBeenCalledWith(
                expect.any(String),
                { code: '987654' },
                expect.any(Object)
            );
        });

        it('propaguje błąd gdy backend zwróci 401', async () => {
            mockAxios.post.mockRejectedValue(new Error('Request failed with status code 401'));

            await expect(authService.verify2FA('000000', 'bad-token')).rejects.toThrow();
        });
    });

    describe('register', () => {
        it('wysyła dane rejestracji na /auth/register', async () => {
            const user = { id: 'u1', email: 'a@b.c', role: 'USER' as const, createdAt: '2024-01-01' };
            mockApi.post.mockResolvedValue({ data: user });

            const result = await authService.register({
                email: 'a@b.c',
                firstName: 'Jan',
                lastName: 'Kowalski',
                newPassword: 'Strong123!',
                repeatNewPassword: 'Strong123!',
            });

            expect(mockApi.post).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
                email: 'a@b.c',
                firstName: 'Jan',
                lastName: 'Kowalski',
            }));
            expect(result).toEqual(user);
        });
    });

    describe('logout', () => {
        it('wysyła POST na /auth/logout', async () => {
            mockApi.post.mockResolvedValue({});

            await authService.logout();

            expect(mockApi.post).toHaveBeenCalledWith('/auth/logout');
        });
    });

    describe('resetPassword', () => {
        it('wysyła email na /auth/reset-password', async () => {
            mockApi.post.mockResolvedValue({});

            await authService.resetPassword('user@example.com');

            expect(mockApi.post).toHaveBeenCalledWith('/auth/reset-password', { email: 'user@example.com' });
        });
    });

    describe('confirmResetPassword', () => {
        it('wysyła token i nowe hasło na /auth/reset-password/confirm', async () => {
            mockApi.post.mockResolvedValue({});

            await authService.confirmResetPassword('reset-token', 'NewPass1!', 'NewPass1!');

            expect(mockApi.post).toHaveBeenCalledWith('/auth/reset-password/confirm', {
                token: 'reset-token',
                newPassword: 'NewPass1!',
                repeatNewPassword: 'NewPass1!',
            });
        });
    });
});

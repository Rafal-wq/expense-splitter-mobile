import { expensesService } from '@/services/expenses.service';
import api from '@/services/api';

jest.mock('@/services/api', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    },
}));

const mockApi = api as { get: jest.Mock; post: jest.Mock; patch: jest.Mock; delete: jest.Mock };

beforeEach(() => {
    jest.clearAllMocks();
});

describe('expensesService', () => {
    describe('getExpenses', () => {
        it('zwraca listę wydatków z odpowiedzi stronicowanej', async () => {
            const expenses = [{ id: '1', title: 'Obiad' }];
            mockApi.get.mockResolvedValue({ data: { content: expenses } });

            const result = await expensesService.getExpenses();

            expect(mockApi.get).toHaveBeenCalledWith('/expenses', { params: {} });
            expect(result).toEqual(expenses);
        });

        it('przekazuje filtr roli do zapytania', async () => {
            mockApi.get.mockResolvedValue({ data: { content: [] } });

            await expensesService.getExpenses('PAYER');

            expect(mockApi.get).toHaveBeenCalledWith('/expenses', { params: { role: 'PAYER' } });
        });
    });

    describe('getExpense', () => {
        it('pobiera szczegóły wydatku po id', async () => {
            const expense = { id: 'e1', title: 'Test' };
            mockApi.get.mockResolvedValue({ data: expense });

            const result = await expensesService.getExpense('e1');

            expect(mockApi.get).toHaveBeenCalledWith('/expenses/e1');
            expect(result).toEqual(expense);
        });
    });

    describe('createPayment', () => {
        it('wysyła POST na /payments z poprawnym ciałem', async () => {
            const payment = { id: 'p1', amount: 100 };
            mockApi.post.mockResolvedValue({ data: payment });

            const result = await expensesService.createPayment({ expenseId: 'e1', amount: 100 });

            expect(mockApi.post).toHaveBeenCalledWith('/payments', { expenseId: 'e1', amount: 100 });
            expect(result).toEqual(payment);
        });
    });

    describe('getPayments', () => {
        it('zwraca tablicę gdy odpowiedź jest tablicą', async () => {
            const payments = [{ id: 'p1' }];
            mockApi.get.mockResolvedValue({ data: payments });

            const result = await expensesService.getPayments('e1');

            expect(mockApi.get).toHaveBeenCalledWith('/expenses/e1/payments');
            expect(result).toEqual(payments);
        });

        it('zwraca content gdy odpowiedź jest stronicowana', async () => {
            const payments = [{ id: 'p1' }];
            mockApi.get.mockResolvedValue({ data: { content: payments } });

            const result = await expensesService.getPayments('e1');

            expect(result).toEqual(payments);
        });

        it('zwraca pustą tablicę gdy brak content', async () => {
            mockApi.get.mockResolvedValue({ data: {} });

            const result = await expensesService.getPayments('e1');

            expect(result).toEqual([]);
        });
    });

    describe('deleteExpense', () => {
        it('wysyła DELETE na poprawny endpoint', async () => {
            mockApi.delete.mockResolvedValue({});

            await expensesService.deleteExpense('e1');

            expect(mockApi.delete).toHaveBeenCalledWith('/expenses/e1');
        });
    });

    describe('updateExpense', () => {
        it('wysyła PATCH z danymi do aktualizacji', async () => {
            const updated = { id: 'e1', title: 'Nowy tytuł' };
            mockApi.patch.mockResolvedValue({ data: updated });

            const result = await expensesService.updateExpense('e1', { title: 'Nowy tytuł' });

            expect(mockApi.patch).toHaveBeenCalledWith('/expenses/e1', { title: 'Nowy tytuł' });
            expect(result).toEqual(updated);
        });
    });
});

import { isExpenseSettled } from '@/utils/expenseSettled';
import { DetailedExpenseResponse, PaymentResponse } from '@/types';

const makeUser = (id: string) => ({
    id,
    email: `${id}@test.com`,
    role: 'USER' as const,
    createdAt: '2024-01-01',
});

const makeExpense = (
    payerId: string,
    shares: { userId: string; amount: number }[]
): DetailedExpenseResponse => ({
    id: 'e1',
    title: 'Test',
    description: null,
    role: 'PAYER',
    payer: makeUser(payerId),
    amountTotal: shares.reduce((s, sh) => s + sh.amount, 0),
    splitType: 'EQUAL',
    shares: shares.map((sh) => ({ user: makeUser(sh.userId), amount: sh.amount })),
    expenseDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
});

const makePayment = (payerId: string, amount: number): PaymentResponse => ({
    id: `p-${payerId}`,
    expense: { id: 'e1', title: 'Test', role: 'PARTICIPANT', amountTotal: 100, expenseDate: '2024-01-01' },
    payer: makeUser(payerId),
    amount,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
});

const PAYER_ID = 'payer';
const USER1_ID = 'user1';
const USER2_ID = 'user2';

describe('isExpenseSettled', () => {
    describe('rola PARTICIPANT', () => {
        const expense = makeExpense(PAYER_ID, [
            { userId: PAYER_ID, amount: 50 },
            { userId: USER1_ID, amount: 50 },
        ]);

        it('zwraca false gdy brak płatności', () => {
            expect(isExpenseSettled(expense, [], USER1_ID, 'PARTICIPANT')).toBe(false);
        });

        it('zwraca false gdy wpłata jest częściowa', () => {
            expect(isExpenseSettled(expense, [makePayment(USER1_ID, 25)], USER1_ID, 'PARTICIPANT')).toBe(false);
        });

        it('zwraca true gdy wpłata pokrywa cały udział', () => {
            expect(isExpenseSettled(expense, [makePayment(USER1_ID, 50)], USER1_ID, 'PARTICIPANT')).toBe(true);
        });

        it('zwraca true gdy wpłata przekracza udział', () => {
            expect(isExpenseSettled(expense, [makePayment(USER1_ID, 75)], USER1_ID, 'PARTICIPANT')).toBe(true);
        });

        it('zwraca false gdy użytkownik nie jest uczestnikiem wydatku', () => {
            expect(isExpenseSettled(expense, [makePayment('nieznany', 50)], 'nieznany', 'PARTICIPANT')).toBe(false);
        });

        it('ignoruje płatności innych użytkowników', () => {
            expect(isExpenseSettled(expense, [makePayment(USER2_ID, 50)], USER1_ID, 'PARTICIPANT')).toBe(false);
        });
    });

    describe('rola PAYER', () => {
        it('zwraca false gdy brak uczestników', () => {
            const expense = makeExpense(PAYER_ID, [{ userId: PAYER_ID, amount: 100 }]);
            expect(isExpenseSettled(expense, [], PAYER_ID, 'PAYER')).toBe(false);
        });

        it('zwraca false gdy brak jakichkolwiek płatności', () => {
            const expense = makeExpense(PAYER_ID, [
                { userId: PAYER_ID, amount: 50 },
                { userId: USER1_ID, amount: 50 },
            ]);
            expect(isExpenseSettled(expense, [], PAYER_ID, 'PAYER')).toBe(false);
        });

        it('zwraca true gdy wszyscy uczestnicy zapłacili', () => {
            const expense = makeExpense(PAYER_ID, [
                { userId: PAYER_ID, amount: 50 },
                { userId: USER1_ID, amount: 50 },
            ]);
            expect(isExpenseSettled(expense, [makePayment(USER1_ID, 50)], PAYER_ID, 'PAYER')).toBe(true);
        });

        it('zwraca false gdy tylko część uczestników zapłaciła', () => {
            const expense = makeExpense(PAYER_ID, [
                { userId: PAYER_ID, amount: 33 },
                { userId: USER1_ID, amount: 33 },
                { userId: USER2_ID, amount: 34 },
            ]);
            expect(isExpenseSettled(expense, [makePayment(USER1_ID, 33)], PAYER_ID, 'PAYER')).toBe(false);
        });

        it('zwraca true gdy wszyscy uczestnicy (wielu) zapłacili', () => {
            const expense = makeExpense(PAYER_ID, [
                { userId: PAYER_ID, amount: 33 },
                { userId: USER1_ID, amount: 33 },
                { userId: USER2_ID, amount: 34 },
            ]);
            const payments = [makePayment(USER1_ID, 33), makePayment(USER2_ID, 34)];
            expect(isExpenseSettled(expense, payments, PAYER_ID, 'PAYER')).toBe(true);
        });
    });
});

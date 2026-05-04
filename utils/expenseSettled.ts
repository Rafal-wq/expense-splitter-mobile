import { DetailedExpenseResponse, ExpenseRole, PaymentResponse } from '@/types';

export function isExpenseSettled(
    detailed: DetailedExpenseResponse,
    payments: PaymentResponse[],
    userId: string,
    role: ExpenseRole
): boolean {
    if (role === 'PARTICIPANT') {
        const myShare = detailed.shares.find((s) => s.user.id === userId);
        if (!myShare) return false;
        const totalPaid = payments
            .filter((p) => p.payer.id === userId)
            .reduce((sum, p) => sum + p.amount, 0);
        return totalPaid >= myShare.amount;
    }

    const nonPayerShares = detailed.shares.filter((s) => s.user.id !== userId);
    if (nonPayerShares.length === 0) return false;
    return nonPayerShares.every((share) => {
        const paid = payments
            .filter((p) => p.payer.id === share.user.id)
            .reduce((sum, p) => sum + p.amount, 0);
        return paid >= share.amount;
    });
}

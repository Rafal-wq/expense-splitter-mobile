import AsyncStorage from '@react-native-async-storage/async-storage';
import { expensesService } from './expenses.service';

const QUEUE_KEY = 'offline_operations_queue';

export interface QueuedExpense {
    tempId: string;
    type: 'CREATE_EXPENSE';
    payload: {
        title: string;
        description?: string;
        amount: number;
        participants: { userId: string }[];
        expenseDate: string;
    };
    timestamp: string;
}

let isProcessing = false;

export const offlineQueueService = {
    async getQueue(): Promise<QueuedExpense[]> {
        try {
            const raw = await AsyncStorage.getItem(QUEUE_KEY);
            return raw ? (JSON.parse(raw) as QueuedExpense[]) : [];
        } catch {
            return [];
        }
    },

    async add(payload: QueuedExpense['payload']): Promise<QueuedExpense> {
        const queue = await this.getQueue();
        const item: QueuedExpense = {
            tempId: `temp_${Date.now()}`,
            type: 'CREATE_EXPENSE',
            payload,
            timestamp: new Date().toISOString(),
        };
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify([...queue, item]));
        return item;
    },

    async remove(tempId: string): Promise<void> {
        const queue = await this.getQueue();
        await AsyncStorage.setItem(
            QUEUE_KEY,
            JSON.stringify(queue.filter((op) => op.tempId !== tempId))
        );
    },

    async processQueue(): Promise<{ synced: number; failed: number }> {
        if (isProcessing) return { synced: 0, failed: 0 };
        isProcessing = true;

        const queue = await this.getQueue();
        let synced = 0;
        let failed = 0;

        try {
            for (const op of queue) {
                try {
                    await expensesService.createExpense(op.payload);
                    await this.remove(op.tempId);
                    synced++;
                } catch (error: any) {
                    if (error?.response) {
                        // Błąd API (4xx/5xx) — nieprawidłowe dane, usuń z kolejki
                        await this.remove(op.tempId);
                    } else {
                        // Błąd sieciowy — zostaw, spróbuj później
                        failed++;
                    }
                }
            }
        } finally {
            isProcessing = false;
        }

        return { synced, failed };
    },

    async clearQueue(): Promise<void> {
        await AsyncStorage.removeItem(QUEUE_KEY);
    },
};

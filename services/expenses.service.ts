import api from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { CreateExpenseRequest, DetailedExpenseResponse, ExpenseResponse, UpdateExpenseRequest } from '@/types';

export const expensesService = {
    getExpenses: async (role?: 'PAYER' | 'PARTICIPANT'): Promise<ExpenseResponse[]> => {
        const response = await api.get(API_ENDPOINTS.EXPENSES.LIST, {
            params: role ? { role } : {},
        });
        return response.data.content;
    },

    getExpense: async (id: string): Promise<DetailedExpenseResponse> => {
        const response = await api.get<DetailedExpenseResponse>(API_ENDPOINTS.EXPENSES.DETAILS(id));
        return response.data;
    },

    createExpense: async (data: CreateExpenseRequest): Promise<DetailedExpenseResponse> => {
        const response = await api.post<DetailedExpenseResponse>(API_ENDPOINTS.EXPENSES.CREATE, data);
        return response.data;
    },

    updateExpense: async (id: string, data: UpdateExpenseRequest): Promise<DetailedExpenseResponse> => {
        const response = await api.patch<DetailedExpenseResponse>(API_ENDPOINTS.EXPENSES.UPDATE(id), data);
        return response.data;
    },

    deleteExpense: async (id: string): Promise<void> => {
        await api.delete(API_ENDPOINTS.EXPENSES.DELETE(id));
    },

    deleteParticipant: async (id: string, participantId: string): Promise<void> => {
        await api.delete(API_ENDPOINTS.EXPENSES.DELETE_PARTICIPANT(id, participantId));
    },
};

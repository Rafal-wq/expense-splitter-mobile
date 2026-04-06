export type Role = 'USER' | 'ADMIN';
export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type AuthProvider = 'GOOGLE' | 'FACEBOOK';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    firstName: string;
    lastName: string;
    newPassword: string;
    repeatNewPassword: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

export interface UserResponse {
    id: string;
    email: string;
    role: Role;
    createdAt: string;
}

export interface SimpleUserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

export interface UserIdentityResponse {
    id: string;
    provider: AuthProvider;
    providerId: string;
}

export interface DetailedUserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    identities: UserIdentityResponse[];
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface UpdateProfileRequest {
    email?: string;
    firstName?: string;
    lastName?: string;
}

export interface PasswordChangeRequest {
    oldPassword: string;
    newPassword: string;
    repeatNewPassword: string;
}

export interface FriendshipRequest {
    recipientId: string;
}

export interface FriendshipResponse {
    id: string;
    requester: UserResponse;
    recipient: UserResponse;
    status: FriendshipStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null; // Instant
}

export interface ExpenseParticipantRequest {
    userId: number;
    value: number;
}

export interface CreateExpenseRequest {
    title: string;
    description?: string;
    amount: number;
    participantIds?: ExpenseParticipantRequest[];
    expenseDate: string;
}

export interface UpdateExpenseRequest {
    title?: string;
    description?: string;
    amount?: number;
}

export interface ExpenseParticipantResponse {
    user: UserResponse;
    amountOwed: number;
}

export interface ExpenseResponse {
    id: string;
    title: string;
    amountTotal: number;
    myBalance: number;
    expenseDate: string;
}

export interface DetailedExpenseResponse {
    id: string;
    title: string;
    description: string | null;
    amountTotal: number;
    myBalance: number;
    participants: ExpenseParticipantResponse[];
    expenseDate: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export type Role = 'USER' | 'ADMIN';
export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type AuthProvider = 'GOOGLE' | 'FACEBOOK';
export type ExpenseRole = 'PAYER' | 'PARTICIPANT';
export type SplitType = 'EQUAL';

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
    twoFactorRequired: boolean;
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
    isTwoFactorAuthEnabled: boolean;
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
    deletedAt: string | null;
}

export interface ExpenseParticipantRequest {
    userId: string;
}

export interface CreateExpenseRequest {
    title: string;
    description?: string;
    amount: number;
    participants?: ExpenseParticipantRequest[];
    expenseDate: string;
}

export interface UpdateExpenseRequest {
    title?: string;
    description?: string;
    amount?: number;
}

export interface ExpenseShare {
    user: UserResponse;
    amount: number;
}

export interface ExpenseResponse {
    id: string;
    title: string;
    role: ExpenseRole;
    amountTotal: number;
    expenseDate: string;
}

export interface DetailedExpenseResponse {
    id: string;
    title: string;
    description: string | null;
    role: ExpenseRole;
    payer: UserResponse;
    amountTotal: number;
    splitType: SplitType;
    shares: ExpenseShare[];
    expenseDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentResponse {
    id: string;
    expense: ExpenseResponse;
    payer: UserResponse;
    amount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePaymentRequest {
    expenseId: string;
    amount: number;
}

export interface NotificationResponse {
    id: string;
    userId: string;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationPreferenceResponse {
    userId: string;
    emailNotificationsEnabled: boolean;
    websocketNotificationsEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateNotificationPreferenceRequest {
    emailNotificationsEnabled?: boolean;
    websocketNotificationsEnabled?: boolean;
}

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

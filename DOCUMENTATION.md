# Expense Splitter Mobile - Documentation

## Tech Stack

- React Native with Expo SDK 54
- TypeScript
- Expo Router (file-based navigation)
- Axios (HTTP client)
- Zustand (global state management)
- Expo Secure Store (secure token storage)

## Project Structure
```
app/
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
├── (app)/
│   ├── _layout.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── expenses.tsx
│       └── friends.tsx
├── _layout.tsx
└── index.tsx

components/
├── auth/
└── ui/

constants/
├── api.ts
└── theme.ts

hooks/
└── useSessionTimeout.ts

services/
├── api.ts
└── auth.service.ts

store/
└── auth.store.ts

types/
└── index.ts
```


## Environment Variables

| Variable | Description |
|---|---|
| EXPO_PUBLIC_API_URL | Backend API base URL |

Copy `.env.example` to `.env` and fill in the values before running the app.

## Backend

The app connects to the Expense Splitter REST API.
API documentation: https://sgorski00.github.io/expense-splitter-api/

To run the backend locally using Docker:
```bash
cd expense-splitter-api
cp .env.example .env
docker-compose up --build -d
```

## Authentication

- JWT-based authentication with access token and refresh token
- Tokens stored securely using Expo Secure Store
- Access token automatically attached to every API request
- Automatic token refresh on 401 response
- Session expires after 15 minutes of inactivity
- Manual logout available from the tab bar

## Completed Features

### Etap 1 — Authentication
- User registration with strong password validation
- User login with JWT token storage
- Password visibility toggle on all password fields
- Automatic redirect based on auth state
- Session timeout after 15 minutes of inactivity
- Manual logout

## Pending Features

### Etap 2 — Friends
- List friends
- Send friend request
- Accept / reject friend request
- Delete friend
- Push notification on new friend request

### Etap 3 — Expenses
- Create expense
- Add / remove participants
- View expense details
- Mark share as paid
- Close expense
- Push notification on new expense

### Etap 4 — OAuth2 Google Login
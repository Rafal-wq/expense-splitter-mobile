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


## Zmienne środowiskowe

| Zmienna | Opis |
|---|---|
| EXPO_PUBLIC_API_URL | Adres URL backendu |

Skopiuj `.env.example` do `.env` i uzupełnij wartości przed uruchomieniem.

## Backend

Aplikacja łączy się z Expense Splitter REST API.
Dokumentacja API: https://sgorski00.github.io/expense-splitter-api/

Uruchomienie backendu lokalnie przez Docker:

```bash
cd expense-splitter-api
cp .env.example .env
docker-compose --profile dev up -d
```

## Uwierzytelnianie

- Uwierzytelnianie oparte na JWT z access token i refresh token
- Tokeny przechowywane bezpiecznie przez Expo Secure Store
- Access token automatycznie dołączany do każdego żądania API
- Automatyczne odświeżanie tokenu przy błędzie 401
- Sesja wygasa po 15 minutach nieaktywności
- Ręczne wylogowanie dostępne z paska zakładek

## Lista funkcjonalności

### Etap 1 — Uwierzytelnianie
- [x] Rejestracja użytkownika z walidacją silnego hasła
- [x] Logowanie z przechowywaniem tokenów JWT
- [x] Podgląd wpisanego hasła (przycisk oczka)
- [x] Reset hasła przez email
- [x] Automatyczne przekierowanie na podstawie stanu auth
- [x] Wygasanie sesji po 15 minutach nieaktywności
- [x] Ręczne wylogowanie

### Etap 2 — Znajomi
- [x] Lista znajomych
- [x] Wyszukiwanie użytkowników po imieniu lub emailu
- [x] Wysyłanie zaproszenia do znajomych
- [x] Akceptowanie zaproszenia do znajomych
- [x] Odrzucanie zaproszenia do znajomych
- [x] Usuwanie znajomego
- [ ] Powiadomienie push o nowym zaproszeniu

### Etap 3 — Wydatki
- [x] Lista wydatków
- [x] Tworzenie wydatku
- [x] Dodawanie uczestników do wydatku
- [x] Usuwanie uczestników z wydatku
- [x] Szczegóły wydatku
- [x] Oznaczanie części jako spłaconej
- [x] Wizualny wskaźnik rozliczenia wydatku na liście
- [ ] Powiadomienie push o nowym wydatku

### Etap 4 — OAuth2
- [ ] Logowanie przez Google

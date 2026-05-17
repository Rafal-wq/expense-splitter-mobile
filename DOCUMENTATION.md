# Expense Splitter Mobile - Documentation

## Tech Stack

- React Native with Expo SDK 54
- TypeScript
- Expo Router (file-based navigation)
- Axios (HTTP client)
- Zustand (global state management)
- Expo Secure Store (secure token storage)
- AsyncStorage (cache i kolejka offline)
- NetInfo (wykrywanie stanu sieci)

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
├── useSessionTimeout.ts
└── useNetworkStatus.ts

components/
└── OfflineBanner.tsx

services/
├── api.ts
├── auth.service.ts
├── cache.service.ts
└── offlineQueue.service.ts

store/
├── auth.store.ts
└── sync.store.ts

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
- [x] Powiadomienie in-app o nowym zaproszeniu (WebSocket + toast)

### Etap 3 — Wydatki
- [x] Lista wydatków
- [x] Tworzenie wydatku
- [x] Dodawanie uczestników do wydatku
- [x] Usuwanie uczestników z wydatku
- [x] Szczegóły wydatku
- [x] Oznaczanie części jako spłaconej
- [x] Wizualny wskaźnik rozliczenia wydatku na liście
- [x] Powiadomienie in-app o nowym wydatku (WebSocket + toast)
- [x] Blokada dodawania siebie jako uczestnika wydatku

### Etap 4 — Tryb offline
- [x] Wykrywanie stanu sieci (NetInfo)
- [x] Baner informacyjny przy braku połączenia
- [x] Cache danych przy logowaniu (wydatki, profil, znajomi)
- [x] Przeglądanie wydatków, profilu i znajomych offline z cache
- [x] Wyszukiwanie uczestników offline z cache znajomych
- [x] Tworzenie wydatku offline — kolejka lokalna z auto-sync
- [x] Automatyczna synchronizacja kolejki przy powrocie internetu
- [x] Wizualny wskaźnik wydatków oczekujących na synchronizację

### Etap 5 — System powiadomień
- [x] Połączenie WebSocket (STOMP-over-SockJS) z autoryzacją JWT
- [x] Subskrypcja kanału `/user/notifications` z auto-reconnect
- [x] Lista nieprzeczytanych powiadomień (ekran + ikona dzwoneczka z badge)
- [x] Oznaczanie powiadomień jako przeczytane (REST `PATCH /notifications/{id}/read`)
- [x] Toast in-app przy nowym powiadomieniu odebranym przez WebSocket

### Etap 6 — OAuth2
- [ ] Logowanie przez Google — niezaimplementowane

Backend OAuth2 jest zaprojektowany pod aplikację SPA web w tej samej domenie: po przekierowaniu z Google backend zwraca tokeny w body odpowiedzi (JSON), bez deep linku czy custom URI scheme dla aplikacji mobilnej. Próba implementacji przez embedded WebView została zablokowana przez politykę Google, która od 2021 roku odrzuca żądania OAuth z embedded webview ze względów bezpieczeństwa (ochrona przed phishingiem). Standardowy mobilny wzorzec — pobranie `id_token` od Google przez `expo-auth-session` (Chrome Custom Tabs) i wymiana go na JWT na backendzie — wymagałby dodania endpointu `POST /auth/oauth2/google/token` po stronie API.

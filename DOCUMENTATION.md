# Expense Splitter Mobile - Documentation

## Tech Stack

- React Native 0.81 z Expo SDK 54
- TypeScript
- Expo Router (nawigacja oparta o strukturę plików, typed routes)
- Axios (klient HTTP z interceptorami)
- Zustand (zarządzanie stanem globalnym)
- Expo Secure Store (bezpieczne przechowywanie tokenów JWT)
- AsyncStorage (cache i kolejka offline)
- NetInfo (wykrywanie stanu sieci)
- @stomp/stompjs + sockjs-client (komunikacja WebSocket — powiadomienia w czasie rzeczywistym)
- react-native-toast-message (powiadomienia in-app)
- Jest + React Native Testing Library (testy jednostkowe)

## Project Structure

```
app/
├── _layout.tsx                 # Layout główny aplikacji
├── index.tsx                   # Punkt wejścia — przekierowanie wg stanu auth
├── (auth)/                     # Ekrany przed zalogowaniem
│   ├── _layout.tsx
│   ├── welcome.tsx             # Ekran powitalny
│   ├── login.tsx               # Logowanie
│   ├── register.tsx            # Rejestracja
│   ├── forgot-password.tsx     # Reset hasła
│   └── two-factor.tsx          # Weryfikacja 2FA przy logowaniu
└── (app)/                      # Ekrany po zalogowaniu
    ├── _layout.tsx
    ├── notifications.tsx       # Lista powiadomień
    ├── two-factor-setup.tsx    # Włączanie 2FA (kod QR)
    ├── (tabs)/                 # Dolny pasek zakładek
    │   ├── _layout.tsx
    │   ├── expenses.tsx        # Lista wydatków
    │   ├── friends.tsx         # Znajomi
    │   └── profile.tsx         # Profil użytkownika
    └── expense/
        ├── create.tsx          # Tworzenie wydatku
        ├── [id].tsx            # Szczegóły wydatku
        └── edit/[id].tsx       # Edycja wydatku

components/
├── ConfirmModal.tsx            # Modal potwierdzenia operacji
├── NotificationsBell.tsx       # Ikona dzwonka z licznikiem powiadomień
└── OfflineBanner.tsx           # Baner trybu offline

constants/
├── api.ts                      # Adresy endpointów API
└── theme.ts

hooks/
├── useNetworkStatus.ts         # Stan połączenia sieciowego
├── useNotificationsSocket.ts   # Cykl życia połączenia WebSocket
├── useSessionTimeout.ts        # Wygasanie sesji po nieaktywności
├── use-color-scheme.ts
├── use-color-scheme.web.ts
└── use-theme-color.ts

services/
├── api.ts                      # Instancja axios + interceptory (auth, refresh)
├── auth.service.ts             # Logowanie, rejestracja, 2FA verify, reset hasła
├── profile.service.ts          # Profil, zmiana hasła, zarządzanie 2FA
├── friends.service.ts          # Znajomi i zaproszenia
├── expenses.service.ts         # Wydatki i płatności
├── users.service.ts            # Wyszukiwanie użytkowników
├── notifications.service.ts    # Powiadomienia (REST)
├── websocket.service.ts        # Klient STOMP-over-SockJS
├── cache.service.ts            # Cache lokalny (AsyncStorage)
└── offlineQueue.service.ts     # Kolejka operacji offline

store/
├── auth.store.ts               # Stan sesji użytkownika
├── notifications.store.ts      # Stan powiadomień (lista, licznik)
└── sync.store.ts               # Sygnał synchronizacji kolejki offline

types/
└── index.ts                    # Definicje typów TypeScript

utils/
├── expenseSettled.ts           # Logika ustalania statusu rozliczenia
└── toast.ts                    # Funkcje pomocnicze toastów

__tests__/
├── services/
│   ├── auth.service.test.ts
│   └── expenses.service.test.ts
├── store/
│   └── notifications.store.test.ts
└── utils/
    └── expenseSettled.test.ts
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
- Opcjonalna dwuetapowa weryfikacja (2FA) oparta na TOTP — zgodna z aplikacjami typu Google Authenticator
- Sesja wygasa po 60 minutach nieaktywności
- Ręczne wylogowanie dostępne z zakładki profilu

## Testy

Projekt zawiera testy jednostkowe uruchamiane poleceniem `npm test`.
Testami pokryto kluczową logikę biznesową (ustalanie statusu rozliczenia wydatku),
serwisy komunikacji z API (auth, expenses) oraz store powiadomień.

## Lista funkcjonalności

### Etap 1 — Uwierzytelnianie
- [x] Rejestracja użytkownika z walidacją silnego hasła
- [x] Logowanie z przechowywaniem tokenów JWT
- [x] Podgląd wpisanego hasła (przycisk oczka)
- [x] Reset hasła przez email
- [x] Automatyczne przekierowanie na podstawie stanu auth
- [x] Ekran powitalny dla niezalogowanych użytkowników
- [x] Wygasanie sesji po 60 minutach nieaktywności
- [x] Ręczne wylogowanie
- [x] Dwuetapowa weryfikacja (2FA) — TOTP, włączanie z kodem QR, weryfikacja przy logowaniu, wyłączanie

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
- [x] Edycja wydatku (tytuł, opis)
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
- [x] Automatyczna synchronizacja kolejki przy powrocie internetu oraz przy powrocie aplikacji z tła
- [x] Wizualny wskaźnik wydatków oczekujących na synchronizację

### Etap 5 — System powiadomień
- [x] Połączenie WebSocket (STOMP-over-SockJS) z autoryzacją JWT
- [x] Subskrypcja kanału `/user/notifications` z auto-reconnect
- [x] Lista nieprzeczytanych powiadomień (ekran + ikona dzwoneczka z badge)
- [x] Oznaczanie powiadomień jako przeczytane (REST `PATCH /notifications/{id}/read`)
- [x] Toast in-app przy nowym powiadomieniu odebranym przez WebSocket

### Etap 6 (do rozwinięcia w przyszłości)— OAuth2
- [ ] Logowanie przez Google — niezaimplementowane w mobilce
- [ ] Logowanie przez Facebook — niezaimplementowane w mobilce


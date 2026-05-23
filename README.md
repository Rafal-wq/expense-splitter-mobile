# Expense Splitter Mobile

Mobilna aplikacja do zarządzania wspólnymi wydatkami w grupie. Umożliwia dzielenie kosztów, śledzenie płatności oraz rozliczanie się ze znajomymi.

Aplikacja jest częścią większego projektu składającego się z:
- **expense-splitter-api** — backend REST API (Spring Boot)
- **expense-splitter-mobile** — aplikacja mobilna (React Native / Expo)

## Funkcjonalności

- Rejestracja i logowanie z tokenami JWT
- Dwuetapowa weryfikacja (2FA) oparta na TOTP — zgodna z Google Authenticator
- Reset hasła przez email
- Zarządzanie znajomymi — wyszukiwanie, zaproszenia, akceptacja/odrzucanie, usuwanie
- Tworzenie i podział wydatków grupowych, edycja wydatków
- Oznaczanie spłat oraz wizualny wskaźnik rozliczenia
- Powiadomienia w czasie rzeczywistym (WebSocket) o nowych zaproszeniach i wydatkach
- Tryb offline — cache danych i kolejka synchronizacji wydatków
- Ekran powitalny dla niezalogowanych użytkowników

## Instalacja aplikacji (Android)

Gotową aplikację można pobrać i zainstalować na urządzeniu z systemem Android jako plik APK.

<img src="docs/qr-install.png" alt="Kod QR — pobierz aplikację" width="220">

Zeskanuj kod QR telefonem lub wejdź pod adres:
[github.com/Rafal-wq/expense-splitter-mobile/releases/latest](https://github.com/Rafal-wq/expense-splitter-mobile/releases/latest)

Następnie:

1. Na stronie wydania pobierz plik `.apk` z sekcji **Assets**.
2. Otwórz pobrany plik na telefonie.
3. Android poprosi o zgodę na instalację z nieznanych źródeł — zezwól aplikacji (np. przeglądarce), z której pobierasz plik.
4. Po zakończeniu instalacji aplikacja **Expense Splitter** pojawi się na ekranie głównym.

Aplikacja wymaga systemu Android w wersji 7.0 lub nowszej.

## Wymagania (tryb deweloperski)

- Node.js 20+
- Expo Go (na urządzeniu z systemem Android lub iOS)

## Uruchomienie aplikacji (tryb deweloperski)

Backend jest wdrożony i dostępny publicznie pod adresem `https://wydatkomat.tech/api`.

```bash
git clone https://github.com/Rafal-wq/expense-splitter-mobile.git
cd expense-splitter-mobile
npm install
cp .env.example .env
```

Uzupełnij plik `.env`:

```
EXPO_PUBLIC_API_URL=https://wydatkomat.tech/api
```

Następnie uruchom serwer deweloperski:

```bash
npx expo start
```

Zeskanuj wyświetlony kod QR aplikacją Expo Go na telefonie. Telefon i komputer muszą znajdować się w tej samej sieci lokalnej.

## Uruchamianie testów

Projekt zawiera testy jednostkowe (Jest + React Native Testing Library) — 59 testów w 4 plikach pokrywających kluczową logikę biznesową, serwisy komunikacji z API oraz globalny stan aplikacji.

```bash
npm test
```

Szczegółowy opis strategii testów (co jest pokryte, jak działa mockowanie, jak dodawać nowe testy): [docs/TESTING.md](docs/TESTING.md).

## Uruchomienie backendu lokalnie (opcjonalne)

Jeśli chcesz uruchomić backend lokalnie zamiast korzystać z wdrożonego serwera, potrzebujesz dodatkowo Docker i Docker Compose.

```bash
git clone https://github.com/sgorski00/expense-splitter-api.git
cd expense-splitter-api
cp .env.example .env
```

Uzupełnij plik `.env` wymaganymi wartościami, następnie uruchom:

```bash
docker-compose --profile dev up -d
```

Backend będzie dostępny pod adresem `http://localhost:8080/api`.
Dokumentacja API: `http://localhost:8080/api/swagger-ui/index.html`
Skrzynka mailowa (mailhog): `http://localhost:8025`

W tym przypadku zmień `EXPO_PUBLIC_API_URL` w `.env` aplikacji mobilnej na adres IP swojego komputera w sieci lokalnej:

```
EXPO_PUBLIC_API_URL=http://<IP_KOMPUTERA>:8080/api
```

## Zmienne środowiskowe

### Backend (.env)

| Zmienna | Opis | Wymagana |
|---|---|---|
| POSTGRES_PASSWORD | Hasło do bazy danych | tak |
| JWT_SECRET_KEY | Klucz do podpisywania tokenów JWT (min. 32 znaki) | tak |
| GOOGLE_CLIENT_ID | Google OAuth2 Client ID | tak |
| GOOGLE_CLIENT_SECRET | Google OAuth2 Client Secret | tak |
| FACEBOOK_CLIENT_ID | Facebook OAuth2 Client ID | tak |
| FACEBOOK_CLIENT_SECRET | Facebook OAuth2 Client Secret | tak |
| ES_FIRST_ADMIN_EMAIL | Email pierwszego administratora | tak |
| ES_FIRST_ADMIN_PASSWORD | Hasło pierwszego administratora | tak |
| SPRING_MAIL_HOST | Host serwera SMTP | tak |
| SPRING_MAIL_PORT | Port serwera SMTP | tak |

### Aplikacja mobilna (.env)

| Zmienna | Opis | Wymagana |
|---|---|---|
| EXPO_PUBLIC_API_URL | Adres URL backendu | tak |

## Technologie

### Aplikacja mobilna
- React Native 0.81 z Expo SDK 54
- TypeScript
- Expo Router (nawigacja oparta o strukturę plików)
- Axios (klient HTTP z interceptorami)
- Zustand (zarządzanie stanem globalnym)
- Expo Secure Store (bezpieczne przechowywanie tokenów)
- AsyncStorage (cache trybu offline)
- NetInfo (wykrywanie stanu sieci)
- @stomp/stompjs + sockjs-client (komunikacja WebSocket, powiadomienia)
- react-native-toast-message (powiadomienia in-app)
- Jest + React Native Testing Library (testy jednostkowe)

### Backend
- Spring Boot 4
- PostgreSQL
- JWT + Refresh Token
- OAuth2 (Google, Facebook)
- Flyway
- Docker

## Autorzy

- **Rafał Wilczewski** — aplikacja mobilna
- **Sebastian Górski** — backend API
- **Łukasz Szenkiel** - aplikacja desktopowa
- **Jakub Grzymisławski** — aplikacja webowa

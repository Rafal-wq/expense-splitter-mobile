# Expense Splitter Mobile

Mobilna aplikacja do zarządzania wspólnymi wydatkami w grupie. Umożliwia dzielenie kosztów, śledzenie płatności oraz rozliczanie się ze znajomymi.

Aplikacja jest częścią większego projektu składającego się z:
- **expense-splitter-api** — backend REST API (Spring Boot)
- **expense-splitter-mobile** — aplikacja mobilna (React Native / Expo)

## Wymagania

- Node.js 20+
- Docker i Docker Compose
- Expo Go (na urządzeniu mobilnym z Android)

## Uruchomienie backendu

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

## Uruchomienie aplikacji mobilnej

```bash
git clone https://github.com/Rafal-wq/expense-splitter-mobile.git
cd expense-splitter-mobile
npm install
cp .env.example .env
```

Uzupełnij plik `.env`:

EXPO_PUBLIC_API_URL=http://<IP_KOMPUTERA>:8080/api

Gdzie `<IP_KOMPUTERA>` to adres IP Twojego komputera w sieci lokalnej.

Następnie uruchom:

```bash
npx expo start
```

Zeskanuj kod QR aplikacją Expo Go na telefonie.

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
- React Native z Expo SDK 54
- TypeScript
- Expo Router
- Axios
- Zustand
- Expo Secure Store

### Backend
- Spring Boot 4
- PostgreSQL
- JWT + Refresh Token
- OAuth2 (Google, Facebook)
- Flyway
- Docker

## Autorzy

- **Rafał** — aplikacja mobilna
- **Sebastian Górski** — backend API
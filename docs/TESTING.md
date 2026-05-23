# Testy — Expense Splitter Mobile

Dokument opisuje strategię testów jednostkowych w aplikacji mobilnej Expense Splitter, ich zakres, sposób mockowania zależności oraz zasady dodawania nowych testów.

## Stos technologiczny

- **Jest** — framework testów
- **jest-expo** — preset Jest dostosowany do projektów Expo (transformacje, konfiguracja środowiska)
- **@testing-library/react-native** — biblioteka pomocnicza do testowania komponentów React Native (zainstalowana, gotowa do użycia gdy będziemy rozszerzać pokrycie o testy komponentów)
- **@testing-library/jest-native** — dodatkowe matchery dla testów komponentów

## Uruchamianie testów

```bash
npm test
```

Polecenie uruchamia wszystkie testy w katalogu `__tests__/`. Jest wykrywa pliki po wzorcu `*.test.ts` / `*.test.tsx`.

Aby uruchomić pojedynczy plik testowy:

```bash
npm test -- __tests__/utils/expenseSettled.test.ts
```

Aby uruchomić testy z trybem watch (re-run przy zmianach):

```bash
npm test -- --watch
```

## Konfiguracja

Konfiguracja Jest znajduje się w pliku `jest.config.js` w katalogu głównym projektu. Najważniejsze ustawienia:

- `preset: 'jest-expo'` — używamy oficjalnego presetu Expo, który zapewnia poprawne transformacje TypeScript / JSX, mapowanie modułów i mocki natywnych komponentów React Native
- `testEnvironment: 'node'` — testy uruchamiane są w środowisku Node (nie jsdom) — wystarczające dla testów logiki, serwisów i Zustand store
- `moduleNameMapper` z `@/...` — alias `@/` mapuje na katalog główny projektu (tak samo jak w produkcyjnym kodzie), dzięki czemu importy w testach są identyczne jak w aplikacji
- `setupFiles: ['<rootDir>/jest.setup.js']` — globalne mocki ładowane przed każdym testem

## Globalne mocki (`jest.setup.js`)

W pliku `jest.setup.js` mockujemy moduły, których nie chcemy uruchamiać w testach:

```js
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
    router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
    useLocalSearchParams: jest.fn(() => ({})),
    useFocusEffect: jest.fn(),
}));
```

Dzięki temu każdy test ma „za darmo" wyzerowane mocki tych modułów. SecureStore i router nie wykonują żadnych prawdziwych operacji, są bezpieczne w testach.

## Strategia pokrycia

Testami pokrywamy **trzy warstwy** o najwyższym stosunku wartości do kosztu:

1. **Czysta logika biznesowa** (funkcje w `utils/`) — funkcje bez efektów ubocznych, łatwe do testowania, kluczowe dla poprawności aplikacji
2. **Serwisy komunikacji z API** (`services/*.service.ts`) — kontrakt z backendem; testy chronią przed regresjami przy zmianach endpointów lub kształtu danych
3. **Globalny stan aplikacji** (`store/*.store.ts`) — przejścia stanów Zustand; krytyczne dla działania UI

## Lista plików testowych

```
__tests__/
├── services/
│   ├── auth.service.test.ts          # serwis uwierzytelniania
│   └── expenses.service.test.ts      # serwis wydatków
├── store/
│   └── notifications.store.test.ts   # store powiadomień
└── utils/
    └── expenseSettled.test.ts        # logika obliczania statusu rozliczenia
```

### `utils/expenseSettled.test.ts`

Testuje funkcję `isExpenseSettled`, która określa czy wydatek jest w pełni rozliczony. To **serce logiki biznesowej** aplikacji — od jej poprawności zależy poprawność wskaźników „Rozliczony" na całej liście wydatków.

Testy pokrywają dwie role użytkownika (PAYER i PARTICIPANT) oraz przypadki brzegowe:
- brak płatności
- płatność częściowa
- płatność pełna
- nadpłata
- użytkownik nieobecny w liście udziałów
- płatności innych uczestników nie wpływają na status rozliczenia naszego udziału
- wszyscy uczestnicy zapłacili (PAYER widzi „rozliczony")
- tylko część uczestników zapłaciła (PAYER nie widzi „rozliczony")

### `services/expenses.service.test.ts`

Testuje wywołania REST API serwisu wydatków. Mockuje instancję axios (`@/services/api`) i weryfikuje, że:
- metody wywołują właściwe endpointy
- przekazują poprawne parametry zapytań (np. filtr roli)
- zwracają dane w oczekiwanej strukturze
- obsługują różne kształty odpowiedzi (zarówno tablicowe, jak i paginowane)

Pokryte metody: `getExpenses`, `getExpense`, `createPayment`, `getPayments`, `deleteExpense`, `updateExpense`.

### `services/auth.service.test.ts`

Testuje serwis uwierzytelniania. **Szczególnie istotny test regresyjny** dotyczy metody `verify2FA`, która świadomie używa **surowego `axios`** (a nie wspólnej instancji `api`), aby pominąć interceptor doklejający token z SecureStore. Powód: weryfikacja 2FA wymaga przekazania *challenge tokenu* z parametrów funkcji, a nie tokenu z magazynu. Test sprawdza, że:

- `verify2FA` używa raw axios, nie singletonu `api`
- nagłówek `Authorization: Bearer <challenge>` jest jawnie ustawiony
- kod TOTP trafia w body jako `{ code }`
- błąd 401 jest propagowany dalej

Dodatkowo pokryte: `login` (zarówno wariant bez 2FA, jak i z `twoFactorRequired=true`), `register`, `logout`, `resetPassword`, `confirmResetPassword`.

### `store/notifications.store.test.ts`

Testuje globalny store powiadomień (Zustand). Pokrywa wszystkie operacje store'a:
- stan początkowy (`items=[]`, `unreadCount=0`)
- `hydrate` — ustawia listę i poprawnie liczy nieprzeczytane na podstawie pola `isRead`
- `hydrate` — zeruje licznik gdy wszystkie powiadomienia są przeczytane
- `hydrate` — nadpisuje poprzedni stan
- `addIncoming` — dodaje nowe powiadomienie na początek listy
- `addIncoming` — ignoruje duplikaty po `id`
- `addIncoming` — inkrementuje licznik nieprzeczytanych tylko dla nieprzeczytanych powiadomień
- `markAsRead` — usuwa powiadomienie z listy i aktualizuje licznik
- `markAsRead` — jest no-op dla nieistniejącego id
- `reset` — czyści cały stan

Każdy test zaczyna od `useNotificationsStore.setState({ items: [], unreadCount: 0 })` w `beforeEach`, aby uniknąć wpływu wcześniejszych testów.

## Wzorce mockowania

### Mockowanie singletonu `api`

`services/api.ts` eksportuje skonfigurowaną instancję axios. W testach zastępujemy ją mockiem zawierającym tylko potrzebne metody HTTP:

```ts
jest.mock('@/services/api', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    },
}));

const mockApi = api as unknown as { get: jest.Mock; post: jest.Mock };

beforeEach(() => {
    jest.clearAllMocks();
});
```

Pozwala to weryfikować dokładne argumenty wywołania (`toHaveBeenCalledWith`) oraz kontrolować zwracane wartości (`mockResolvedValue`).

### Mockowanie surowego `axios`

`verify2FA` używa surowego `axios` (nie singletonu `api`), więc mockujemy go osobno:

```ts
jest.mock('axios', () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
    },
}));
```

To pozwala sprawdzić w teście, że metoda **na pewno** korzysta z `axios`, a nie z `api` — co jest istotne, bo gdyby przeszła na `api`, interceptor nadpisałby nagłówek `Authorization` tokenem ze SecureStore i flow 2FA przestałby działać.

### Mockowanie modułów Expo

Globalne mocki `expo-secure-store` i `expo-router` (w `jest.setup.js`) pozwalają testom nie martwić się o wywołania tych modułów. Każdy test może w razie potrzeby ustawić własne zwracane wartości:

```ts
import * as SecureStore from 'expo-secure-store';
(SecureStore.getItemAsync as jest.Mock).mockResolvedValue('fake-token');
```

## Co świadomie nie jest pokryte testami

**Komponenty UI i ekrany** — testy komponentów są możliwe (RNTL jest zainstalowane), ale świadomie zostały odłożone. Powody:

- Komponenty zmieniają się często w trakcie iteracji UI/UX — testy snapshotowe lub interakcyjne wymagałyby częstej aktualizacji
- Wartość krytyczna komponentów leży głównie w logice osadzonej w hookach i serwisach, a te są już pokryte
- Ręczne testowanie UI na fizycznym urządzeniu (przez Expo Go) daje szybszy feedback w fazie rozwoju

**Hooki** (`useNotificationsSocket`, `useSessionTimeout`, `useNetworkStatus`) — pokrywałyby się z testami integracyjnymi WebSocketu i AppState; wymagają złożonego mockowania timerów i event emitterów. Pominięte ze względu na koszt.

**Testy end-to-end** — narzędzia typu Detox lub Maestro wymagałyby osobnego pipeline'u CI/CD oraz emulatorów. Poza zakresem projektu na obecnym etapie.

**Testy integracyjne backendu z mobilką** — wymagałyby uruchomionego backendu (lub mocka serwera HTTP); kontrakt jest weryfikowany ręcznie i pokryty od strony API testami integracyjnymi w repozytorium backendu.

## Jak dodać nowy test

1. **Wybierz lokalizację** zgodnie ze strukturą warstw: testy funkcji z `utils/` idą do `__tests__/utils/`, serwisów do `__tests__/services/`, store'ów do `__tests__/store/`.

2. **Utwórz plik** z rozszerzeniem `.test.ts` lub `.test.tsx` (dla komponentów). Konwencja: nazwa pliku odpowiada testowanemu modułowi, np. `friends.service.test.ts`.

3. **Importuj testowany moduł** używając aliasu `@/`:
   ```ts
   import { friendsService } from '@/services/friends.service';
   ```

4. **Mockuj zależności** w razie potrzeby — najczęściej singleton `api`.

5. **Pisz testy** w blokach `describe` + `it`, używaj asercji Jest:
   ```ts
   describe('friendsService', () => {
       it('wysyła zaproszenie do znajomych', async () => {
           mockApi.post.mockResolvedValue({ data: { id: 'f1' } });
           await friendsService.sendFriendRequest('user-123');
           expect(mockApi.post).toHaveBeenCalledWith(
               '/friendships',
               { recipientId: 'user-123' }
           );
       });
   });
   ```

6. **Uruchom test** lokalnie (`npm test`) i upewnij się, że wszystkie testy w projekcie nadal przechodzą.

## Konwencje

- **Język opisów testów:** polski (`it('zwraca listę wydatków...')`), spójnie z resztą projektu
- **`beforeEach(() => jest.clearAllMocks())`** w każdym pliku, gdzie używamy mocków
- **`describe` / `it`** zamiast `test` — dla czytelności struktury
- **Asercje na argumenty** (`toHaveBeenCalledWith`) zamiast `toHaveBeenCalled` — ścisłe sprawdzenie kontraktu
- **Mockowanie minimalnej powierzchni** — tylko metody, których faktycznie używamy w teście

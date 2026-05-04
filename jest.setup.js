// Zastąp lazy getter __ExpoImportMetaRegistry prostą wartością zanim jakikolwiek
// kod go wywoła. Getter zainstalowany przez jest-expo/src/preset/setup.js via
// require('expo/src/winter') próbuje require('./ImportMetaRegistry') gdy jest
// dostępowany poza kontekstem kodu testowego, co powoduje błąd jest-runtime.
if (typeof global.__ExpoImportMetaRegistry === 'undefined') {
    Object.defineProperty(global, '__ExpoImportMetaRegistry', {
        value: { url: null },
        configurable: true,
        writable: true,
        enumerable: false,
    });
} else {
    // Getter już zainstalowany przez jest-expo — nadpisz go prostą wartością
    try {
        global.__ExpoImportMetaRegistry = { url: null };
    } catch {
        Object.defineProperty(global, '__ExpoImportMetaRegistry', {
            value: { url: null },
            configurable: true,
            writable: true,
            enumerable: false,
        });
    }
}

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

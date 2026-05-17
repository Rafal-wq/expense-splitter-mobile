import { useNotificationsStore } from '@/store/notifications.store';
import { NotificationResponse } from '@/types';

const makeNotification = (id: string, isRead = false): NotificationResponse => ({
    id,
    userId: 'user-1',
    title: `Title ${id}`,
    body: `Body ${id}`,
    isRead,
    createdAt: '2024-01-01T00:00:00Z',
});

beforeEach(() => {
    useNotificationsStore.setState({ items: [], unreadCount: 0 });
});

describe('useNotificationsStore', () => {
    describe('stan początkowy', () => {
        it('items jest pustą tablicą i unreadCount = 0', () => {
            const state = useNotificationsStore.getState();
            expect(state.items).toEqual([]);
            expect(state.unreadCount).toBe(0);
        });
    });

    describe('hydrate', () => {
        it('ustawia items i liczy unreadCount na podstawie isRead', () => {
            const items = [
                makeNotification('1', false),
                makeNotification('2', false),
                makeNotification('3', true),
            ];

            useNotificationsStore.getState().hydrate(items);

            const state = useNotificationsStore.getState();
            expect(state.items).toEqual(items);
            expect(state.unreadCount).toBe(2);
        });

        it('zeruje unreadCount gdy wszystkie powiadomienia są przeczytane', () => {
            const items = [makeNotification('1', true), makeNotification('2', true)];

            useNotificationsStore.getState().hydrate(items);

            expect(useNotificationsStore.getState().unreadCount).toBe(0);
        });

        it('nadpisuje poprzedni stan', () => {
            useNotificationsStore.setState({
                items: [makeNotification('old', false)],
                unreadCount: 1,
            });

            useNotificationsStore.getState().hydrate([makeNotification('new', false)]);

            const state = useNotificationsStore.getState();
            expect(state.items.length).toBe(1);
            expect(state.items[0].id).toBe('new');
        });
    });

    describe('addIncoming', () => {
        it('dodaje nowe powiadomienie na początek listy', () => {
            useNotificationsStore.getState().hydrate([makeNotification('1', false)]);

            useNotificationsStore.getState().addIncoming(makeNotification('2', false));

            const state = useNotificationsStore.getState();
            expect(state.items.length).toBe(2);
            expect(state.items[0].id).toBe('2');
            expect(state.unreadCount).toBe(2);
        });

        it('ignoruje duplikat (po id)', () => {
            const existing = makeNotification('1', false);
            useNotificationsStore.getState().hydrate([existing]);

            useNotificationsStore.getState().addIncoming(existing);

            const state = useNotificationsStore.getState();
            expect(state.items.length).toBe(1);
            expect(state.unreadCount).toBe(1);
        });

        it('zwiększa unreadCount tylko gdy nowe powiadomienie jest isRead=false', () => {
            useNotificationsStore.getState().addIncoming(makeNotification('1', true));

            expect(useNotificationsStore.getState().unreadCount).toBe(0);
        });
    });

    describe('markAsRead', () => {
        it('usuwa powiadomienie z listy i aktualizuje unreadCount', () => {
            useNotificationsStore.getState().hydrate([
                makeNotification('1', false),
                makeNotification('2', false),
            ]);

            useNotificationsStore.getState().markAsRead('1');

            const state = useNotificationsStore.getState();
            expect(state.items.length).toBe(1);
            expect(state.items[0].id).toBe('2');
            expect(state.unreadCount).toBe(1);
        });

        it('jest no-op gdy id nie istnieje', () => {
            useNotificationsStore.getState().hydrate([makeNotification('1', false)]);

            useNotificationsStore.getState().markAsRead('nieistnieje');

            const state = useNotificationsStore.getState();
            expect(state.items.length).toBe(1);
            expect(state.unreadCount).toBe(1);
        });
    });

    describe('reset', () => {
        it('czyści items i unreadCount', () => {
            useNotificationsStore.getState().hydrate([
                makeNotification('1', false),
                makeNotification('2', false),
            ]);

            useNotificationsStore.getState().reset();

            const state = useNotificationsStore.getState();
            expect(state.items).toEqual([]);
            expect(state.unreadCount).toBe(0);
        });
    });
});

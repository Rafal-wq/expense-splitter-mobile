import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from
        'sockjs-client';
import { API_BASE_URL } from '@/constants/api';

export interface IncomingNotification {
    id: string;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
}

type Listener = (msg: IncomingNotification) => void;

class NotificationsSocket {
    private client: Client | null = null;
    private subscription: StompSubscription | null = null;
    private listeners: Set<Listener> = new Set();

    connect(token: string) {
        if (this.client?.active) return;

        this.client = new Client({
            webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`) as any,
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
                this.subscription = this.client!.subscribe(
                    '/user/notifications',
                    (msg: IMessage) => {
                        try {
                            const payload = JSON.parse(msg.body) as IncomingNotification;
                            this.listeners.forEach((l) => l(payload));
                        } catch {
                            // ignore malformed payloads
                        }
                    }
                );
            },
            onStompError: (frame) => {
                console.warn('STOMP error:', frame.headers['message'], frame.body);
            },
            onWebSocketError: (event) => {
                console.warn('WebSocket error:', event);
            },
        });

        this.client.activate();
    }

    addListener(l: Listener) {
        this.listeners.add(l);
        return () => {
            this.listeners.delete(l);
        };
    }

    disconnect() {
        this.subscription?.unsubscribe();
        this.subscription = null;
        if (this.client?.active) {
            void this.client.deactivate();
        }
        this.client = null;
        this.listeners.clear();
    }
}

export const notificationsSocket = new NotificationsSocket();

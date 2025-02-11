import { Client } from '@stomp/stompjs';
import { ANNOUNCEMENT_WEBSOCKET_URL } from '../config';

const AnnouncementWebSocketClient = () => {
    let isConnected = false;
    let subscriptions = {};

    const client = new Client({
        webSocketFactory: () => new WebSocket(ANNOUNCEMENT_WEBSOCKET_URL),
        debug: (str) => console.log('WebSocket debug:', str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    const connect = (onConnectCallback) => {
        if (isConnected) {
            console.log('WebSocket is already connected.');
            return;
        }
        client.onConnect = () => {
            isConnected = true;
            onConnectCallback();
        };
        client.onStompError = (frame) => {
            console.error('WebSocket error:', frame.headers['message']);
            console.error('Additional details:', frame.body);
        };
        client.activate();
    };

    const subscribe = (topic, callback) => {
        if (subscriptions[topic]) {
            console.log(`Already subscribed to topic: ${topic}`);
            return subscriptions[topic];
        }
        const subscription = client.subscribe(topic, (message) => {
            callback(JSON.parse(message.body));
        });
        subscriptions[topic] = subscription;
        return subscription;
    };

    const unsubscribe = (topic) => {
        if (subscriptions[topic]) {
            subscriptions[topic].unsubscribe();
            delete subscriptions[topic];
        }
    };

    const disconnect = () => {
        if (isConnected) {
            client.deactivate();
            isConnected = false;
        }
    };

    return {
        connect,
        subscribe,
        unsubscribe,
        disconnect,
        isSubscribed: (topic) => !!subscriptions[topic],
    };
};

export default AnnouncementWebSocketClient;
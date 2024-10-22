import { Client } from '@stomp/stompjs';
import { WEBSOCKET_URL } from '../config';  // Ensure the correct URL is used

const WebSocketClient = () => {
    let isConnected = false;  // Track connection status
    let subscriptions = {};   // Track active subscriptions

    const client = new Client({
        webSocketFactory: () => new WebSocket(WEBSOCKET_URL),
        debug: (str) => {
            console.log('WebSocket debug: ', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    const connect = (onConnectCallback) => {
        // Check if already connected
        if (isConnected) {
            console.log('WebSocket is already connected.');
            return;
        }

        client.onConnect = () => {
            isConnected = true;  // Mark as connected
            onConnectCallback();
        };
        client.onStompError = (frame) => {
            console.error('Broker reported error: ', frame.headers['message']);
            console.error('Additional details: ', frame.body);
        };
        client.activate();
    };

    const subscribe = (topic, callback) => {
        // Check if already subscribed
        if (subscriptions[topic]) {
            console.log(`Already subscribed to topic: ${topic}`);
            return subscriptions[topic];  // Return the existing subscription
        }

        // Subscribe to the topic and save the subscription
        const subscription = client.subscribe(topic, (message) => {
            callback(JSON.parse(message.body));
        });

        subscriptions[topic] = subscription;  // Save the subscription
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
            isConnected = false;  // Reset connection status
        }
    };

    return {
        connect,
        subscribe,
        unsubscribe,
        disconnect,
        isSubscribed: (topic) => !!subscriptions[topic],  // Check if a topic is already subscribed
    };
};

export default WebSocketClient;


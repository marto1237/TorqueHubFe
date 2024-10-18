import { WEBSOCKET_URL } from '../config';
import { Client } from '@stomp/stompjs';

const WebSocketClient = (socketUrl) => {
    const client = new Client({
        brokerURL: socketUrl,
        debug: (str) => {
            console.log('WebSocket debug: ', str);
        },
        reconnectDelay: 5000, // Automatically reconnect after 5 seconds
        heartbeatIncoming: 4000, // Heartbeat checks
        heartbeatOutgoing: 4000,
    });

    // Method to activate the WebSocket connection
    const connect = (onConnectCallback) => {
        client.onConnect = onConnectCallback;
        client.onStompError = (frame) => {
            console.error('Broker reported error: ', frame.headers['message']);
            console.error('Additional details: ', frame.body);
        };
        client.activate();
    };

    // Method to subscribe to a topic
    const subscribe = (topic, callback) => {
        return client.subscribe(topic, (message) => {
            callback(JSON.parse(message.body));
        });
    };

    // Method to disconnect the client
    const disconnect = () => {
        if (client.connected) {
            client.deactivate();
        }
    };

    return {
        connect,
        subscribe,
        disconnect,
    };
};

export default WebSocketClient;

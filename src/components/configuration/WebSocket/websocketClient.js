import { Client } from '@stomp/stompjs';
import { WEBSOCKET_URL } from '../config';  // Ensure the correct URL is used

const WebSocketClient = () => {
    const client = new Client({
        webSocketFactory: () => new WebSocket(WEBSOCKET_URL),  // Use the native WebSocket API
        debug: (str) => {
            console.log('WebSocket debug: ', str);
        },
        reconnectDelay: 5000,  // Automatically reconnect after 5 seconds if the connection is lost
        heartbeatIncoming: 4000,  // Heartbeat settings for incoming messages
        heartbeatOutgoing: 4000,  // Heartbeat settings for outgoing messages
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
            callback(JSON.parse(message.body));  // Handle incoming messages
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

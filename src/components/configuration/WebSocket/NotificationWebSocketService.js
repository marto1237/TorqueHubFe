import WebSocketClient from './websocketClient';
import { WEBSOCKET_URL } from '../config';

const NotificationWebSocketService = (userId, onMessageCallback) => {
    const socketUrl = `${WEBSOCKET_URL}`;
    const webSocketClient = WebSocketClient(socketUrl);

    // Connect to the WebSocket server
    const connect = () => {
        webSocketClient.connect(() => {
            console.log('Connected to WebSocket server for notifications.');
            subscribeToNotifications();
        });
    };

    // Subscribe to the user's notification topic
    const subscribeToNotifications = () => {
        const notificationTopic = `/topic/notifications/${userId}`;
        webSocketClient.subscribe(notificationTopic, (message) => {
            console.log('Received notification:', message); // Log received notifications
            onMessageCallback(message);
        });
    };

    // Disconnect from the WebSocket server
    const disconnect = () => {
        webSocketClient.disconnect();
    };

    return { connect, disconnect };
};

export default NotificationWebSocketService;

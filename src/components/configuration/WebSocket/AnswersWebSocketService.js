import WebSocketClient from './websocketClient';

const AnswerWebSocketService = (questionId, onMessageCallback) => {
    const webSocketClient = WebSocketClient();

    // Connect to the WebSocket server
    const connect = () => {
        console.log('Connecting to WebSocket...');
        webSocketClient.connect(() => {
            subscribeToAnswers();
        });
    };

    // Subscribe to the user's notification topic
    const subscribeToAnswers = () => {
        const notificationTopic = `/topic/answers/${questionId}`;

        // Check if already subscribed to prevent duplicate subscriptions
        if (webSocketClient.isSubscribed(notificationTopic)) {
            return;
        }
        webSocketClient.subscribe(notificationTopic, (message) => {
            onMessageCallback(message);
        });
    };


    // Disconnect from the WebSocket server
    const disconnect = () => {
        webSocketClient.disconnect();
    };

    return { connect, disconnect };
};

export default AnswerWebSocketService;

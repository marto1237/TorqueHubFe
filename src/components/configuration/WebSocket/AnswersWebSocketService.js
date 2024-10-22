import WebSocketClient from './websocketClient';

const AnswerWebSocketService = (questionId, onMessageCallback) => {
    const webSocketClient = WebSocketClient();

    // Connect to the WebSocket server
    const connect = () => {
        console.log('Connecting to WebSocket...');
        webSocketClient.connect(() => {
            console.log('Connected to WebSocket server for answers.');
            subscribeToAnswers();
        });
    };

    // Subscribe to the user's notification topic
    const subscribeToAnswers = () => {
        const notificationTopic = `/questions/${questionId}/answers`;

        // Check if already subscribed to prevent duplicate subscriptions
        if (webSocketClient.isSubscribed(notificationTopic)) {
            console.log('Already subscribed to topic:', notificationTopic);
            return;
        }

        console.log('Subscribing to topic:', notificationTopic);
        webSocketClient.subscribe(notificationTopic, (message) => {
            console.log('Received notification:', message);
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

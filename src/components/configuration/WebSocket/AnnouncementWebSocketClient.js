import { Client } from '@stomp/stompjs';
import { ANNOUNCEMENT_WEBSOCKET_URL } from '../config';

// Create a singleton instance to prevent multiple connections
let singletonClient = null;
let isConnecting = false;
let hasActiveSubscriptions = false;

const AnnouncementWebSocketClient = () => {
    let isConnected = false;
    let subscriptions = {};
    let connectionAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 3;

    // Use the singleton client or create a new one
    if (!singletonClient) {
        singletonClient = new Client({
            webSocketFactory: () => new WebSocket(ANNOUNCEMENT_WEBSOCKET_URL),
            debug: (str) => console.log('WebSocket debug:', str),
            // Disable automatic reconnection completely - we'll handle it manually
            reconnectDelay: 0,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        // Add disconnect handler
        singletonClient.onWebSocketClose = (closeEvent) => {
            console.log('WebSocket connection closed:', closeEvent ? closeEvent.reason : 'Unknown reason');
            isConnected = false;
            
            // Only attempt to reconnect if:
            // 1. We haven't reached max attempts
            // 2. We have active subscriptions that need the connection
            if (connectionAttempts < MAX_RECONNECT_ATTEMPTS && hasActiveSubscriptions) {
                connectionAttempts++;
                console.log(`Connection closed. Reconnection attempt ${connectionAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
                
                // Wait 5 seconds before attempting to reconnect
                setTimeout(() => {
                    if (hasActiveSubscriptions) {
                        console.log('Attempting to reconnect due to active subscriptions...');
                        try {
                            isConnecting = true;
                            singletonClient.activate();
                        } catch (error) {
                            console.error('Error during reconnection:', error);
                            isConnecting = false;
                        }
                    }
                }, 5000);
            } else if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
                console.log('Max reconnection attempts reached. Stopping reconnection.');
            } else {
                console.log('No active subscriptions, not attempting to reconnect.');
            }
        };
    }
    
    const client = singletonClient;

    const connect = (onConnectCallback) => {
        // Check if already connected or in the process of connecting
        if (isConnected) {
            console.log('WebSocket is already connected.');
            onConnectCallback && onConnectCallback();
            return;
        }
        
        if (isConnecting) {
            console.log('WebSocket connection is in progress.');
            return;
        }
        
        isConnecting = true;
        
        client.onConnect = () => {
            console.log('Successfully connected to announcement WebSocket');
            isConnected = true;
            isConnecting = false;
            connectionAttempts = 0; // Reset connection attempts on successful connection
            onConnectCallback && onConnectCallback();
        };
        
        client.onStompError = (frame) => {
            console.error('WebSocket error:', frame.headers['message']);
            console.error('Additional details:', frame.body);
            isConnecting = false;
        };
        
        try {
            client.activate();
        } catch (error) {
            console.error('Error activating WebSocket client:', error);
            isConnecting = false;
        }
    };

    const subscribe = (topic, callback) => {
        if (!isConnected) {
            console.warn('Cannot subscribe, WebSocket is not connected');
            return null;
        }
        
        if (subscriptions[topic]) {
            console.log(`Already subscribed to topic: ${topic}`);
            return subscriptions[topic];
        }
        
        try {
            const subscription = client.subscribe(topic, (message) => {
                try {
                    const parsedBody = JSON.parse(message.body);
                    callback(parsedBody);
                } catch (error) {
                    console.error('Error parsing message body:', error);
                }
            });
            subscriptions[topic] = subscription;
            hasActiveSubscriptions = true; // Mark that we have active subscriptions
            return subscription;
        } catch (error) {
            console.error(`Error subscribing to ${topic}:`, error);
            return null;
        }
    };

    const unsubscribe = (topic) => {
        if (subscriptions[topic]) {
            try {
                subscriptions[topic].unsubscribe();
                delete subscriptions[topic];
                console.log(`Unsubscribed from topic: ${topic}`);
                
                // Check if we still have any active subscriptions
                hasActiveSubscriptions = Object.keys(subscriptions).length > 0;
                
                // If no more subscriptions, consider disconnecting
                if (!hasActiveSubscriptions) {
                    console.log('No more active subscriptions, considering disconnection');
                }
            } catch (error) {
                console.error(`Error unsubscribing from ${topic}:`, error);
            }
        }
    };

    const disconnect = () => {
        if (isConnected) {
            try {
                // Unsubscribe from all topics first
                Object.keys(subscriptions).forEach(unsubscribe);
                
                client.deactivate();
                console.log('WebSocket client deactivated');
                isConnected = false;
                hasActiveSubscriptions = false;
            } catch (error) {
                console.error('Error disconnecting WebSocket:', error);
            }
        }
    };

    // Add a method to explicitly disable reconnection
    const disableReconnection = () => {
        console.log('Explicitly disabling WebSocket reconnection');
        connectionAttempts = MAX_RECONNECT_ATTEMPTS;
    };

    return {
        connect,
        subscribe,
        unsubscribe,
        disconnect,
        disableReconnection,
        isSubscribed: (topic) => !!subscriptions[topic],
        isConnected: () => isConnected,
    };
};

export default AnnouncementWebSocketClient;
import { Client } from '@stomp/stompjs';

class QuestionWebSocketService {
    constructor(socketUrl, questionId) {
        this.client = new Client({
            brokerURL: socketUrl,
            debug: (str) => console.log('WebSocket debug: ', str),
        });
        this.questionId = questionId;
        this.subscriptions = {};
    }

    connect(onConnectCallback, onErrorCallback) {
        this.client.onConnect = onConnectCallback;
        this.client.onStompError = (frame) => {
            console.error(`Broker reported error: ${frame.headers['message']}`);
            console.error(`Additional details: ${frame.body}`);
            onErrorCallback && onErrorCallback(frame);
        };
        this.client.activate();
    }

    subscribeToAnswers(onNewAnswer) {
        this.subscriptions.answers = this.client.subscribe(`/topic/answers/${this.questionId}`, (message) => {
            const newAnswer = JSON.parse(message.body);
            onNewAnswer(newAnswer);
        });
    }

    subscribeToComments(onNewComment) {
        this.subscriptions.comments = this.client.subscribe(`/topic/comments/${this.questionId}`, (message) => {
            const newComment = JSON.parse(message.body);
            onNewComment(newComment);
        });
    }

    unsubscribe() {
        Object.values(this.subscriptions).forEach((subscription) => {
            if (subscription) {
                subscription.unsubscribe();
            }
        });
    }

    disconnect() {
        this.client.deactivate();
    }
}

export default QuestionWebSocketService;

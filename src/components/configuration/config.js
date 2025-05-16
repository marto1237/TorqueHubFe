const API_BASE_URL =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8080"
        : "/api";

const WEBSOCKET_URL =
    process.env.NODE_ENV === "development"
        ? "ws://localhost:8080/ws"
        : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

const ANNOUNCEMENT_WEBSOCKET_URL =
    process.env.NODE_ENV === "development"
            ? "ws://localhost:8081/ws"
            : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ticket-ws`;

const API_BASE_URL_SHOWCASE =
process.env.NODE_ENV === "development"
    ? "http://localhost:8082" // Showcase API
    : "/showcase-api"; // Relative path for production

const API_BASE_URL_TICKETS =
process.env.NODE_ENV === "development"
    ? "http://localhost:8081" // Tickets API
    : "/ticket-api"; // Relative path for production

export { API_BASE_URL, WEBSOCKET_URL,
         API_BASE_URL_SHOWCASE,
         API_BASE_URL_TICKETS,
         ANNOUNCEMENT_WEBSOCKET_URL
 };

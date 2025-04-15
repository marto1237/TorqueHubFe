const API_BASE_URL =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8080"
        : "http://69.62.116.15:8090";

const WEBSOCKET_URL =
    process.env.NODE_ENV === "development"
        ? "ws://localhost:8080/ws"
        : "http://69.62.116.15:8090/ws";

const ANNOUNCEMENT_WEBSOCKET_URL =
    process.env.NODE_ENV === "development"
            ? "ws://localhost:8081/ws"
            : "ws://localhost/ws";

const API_BASE_URL_SHOWCASE =
process.env.NODE_ENV === "development"
    ? "http://localhost:8082" // Showcase API
    : "http://69.62.116.15:8082"; // Adjust this for production

const API_BASE_URL_TICKETS =
process.env.NODE_ENV === "development"
    ? "http://localhost:8081" // Showcase API
    : "http://69.62.116.15:8081"; // Adjust this for production

export { API_BASE_URL, WEBSOCKET_URL,
         API_BASE_URL_SHOWCASE,
         API_BASE_URL_TICKETS,
         ANNOUNCEMENT_WEBSOCKET_URL
 };

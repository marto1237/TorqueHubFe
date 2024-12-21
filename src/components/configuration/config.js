const API_BASE_URL =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8080"
        : "/api";

const WEBSOCKET_URL =
    process.env.NODE_ENV === "development"
        ? "ws://localhost:8080/ws"
        : "ws://localhost/ws";

const API_BASE_URL_SHOWCASE =
process.env.NODE_ENV === "development"
    ? "http://localhost:8082" // Showcase API
    : "/showcase-api"; // Adjust this for production
    

export { API_BASE_URL, WEBSOCKET_URL,
         API_BASE_URL_SHOWCASE
 };

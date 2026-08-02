const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://api-personal.169.58.100.190.sslip.io"
    : "http://localhost:8000");

export default API_BASE_URL;


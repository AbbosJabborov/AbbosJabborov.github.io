const API_BASE_URL = import.meta.env.PROD
  ? "http://localhost:8000" // Change this to your local Docker backend for testing
  : "http://localhost:8000";

export default API_BASE_URL;

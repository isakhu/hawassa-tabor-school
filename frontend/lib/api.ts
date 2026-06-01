// API Client Utility
// This module will configure and export a centralized HTTP client (e.g., Axios or fetch wrapper)
// for communicating with the FastAPI backend.
// Responsibilities:
//   - Set the base URL from environment variables
//   - Attach JWT Authorization headers to every request automatically
//   - Handle global error responses (401 → redirect to login, 500 → show toast)
//   - Provide typed helper functions: get(), post(), put(), patch(), delete()

export {};

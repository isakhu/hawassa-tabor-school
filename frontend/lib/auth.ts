// Authentication Utilities
// This module will contain all client-side authentication helpers.
// Responsibilities:
//   - Store and retrieve the JWT access token (localStorage / httpOnly cookie)
//   - Decode the JWT payload to extract user role and claims
//   - Provide isAuthenticated() and getUser() helper functions
//   - Handle token refresh logic when the access token expires
//   - Provide a logout() function that clears tokens and redirects to /login

export {};

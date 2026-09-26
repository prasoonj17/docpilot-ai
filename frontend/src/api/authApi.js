import { apiClient } from "./client";

export function login(credentials) {
  return apiClient("/auth/login", { body: credentials });
}

export function register(userData) {
  return apiClient("/auth/register", { body: userData });
}
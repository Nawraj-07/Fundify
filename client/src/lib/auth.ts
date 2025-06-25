import { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  token: string | null;
}

class AuthManager {
  private static instance: AuthManager;
  private state: AuthState = { user: null, token: null };
  private listeners: ((state: AuthState) => void)[] = [];

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  constructor() {
    // Load from localStorage on initialization
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.state = {
        token,
        user: JSON.parse(user)
      };
    }
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  getState(): AuthState {
    return this.state;
  }

  setAuth(user: User, token: string) {
    this.state = { user, token };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.notify();
  }

  clearAuth() {
    this.state = { user: null, token: null };
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.notify();
  }

  getAuthHeader(): Record<string, string> {
    const { token } = this.state;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  isAuthenticated(): boolean {
    return !!this.state.user && !!this.state.token;
  }
}

export const authManager = AuthManager.getInstance();

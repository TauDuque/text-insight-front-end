export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token?: string;
    apiKey?: string;
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

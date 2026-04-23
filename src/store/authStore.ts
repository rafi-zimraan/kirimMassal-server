import { create } from "zustand";
import api from "../lib/api";
import type { User, AuthResponse } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;

  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<AuthResponse>;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("km_token"),
  loading: true,

  init: async () => {
    const token = localStorage.getItem("km_token");
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const { data } = await api.get<{ user: User }>("/auth/me");
      set({ user: data.user, loading: false });
    } catch {
      localStorage.removeItem("km_token");
      set({ user: null, token: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    localStorage.setItem("km_token", data.token);
    set({ user: data.user, token: data.token });
    return data;
  },

  register: async (name, email, password) => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
    });
    localStorage.setItem("km_token", data.token);
    set({ user: data.user, token: data.token });
    return data;
  },

  logout: () => {
    localStorage.removeItem("km_token");
    set({ user: null, token: null });
  },
}));

export default useAuthStore;

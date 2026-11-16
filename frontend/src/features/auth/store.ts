import { create } from "zustand";
import { api } from "@/shared/api/client";
import type { User } from "@/shared/types/api";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  login: async (username, password) => {
    set({ loading: true });
    try {
      const form = new URLSearchParams();
      form.append("username", username);
      form.append("password", password);
      await api.post("/auth/token", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const { data } = await api.get<User>("/auth/me");
      set({ user: data, initialized: true });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      set({ user: null });
    }
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get<User>("/auth/me");
      set({ user: data, initialized: true });
    } catch {
      set({ user: null, initialized: true });
    }
  },

  setUser: (user) => set({ user }),
}));
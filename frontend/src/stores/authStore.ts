import { create } from 'zustand';
import api from '../api/axios';
import { User } from '../types';

interface AuthState { user: User | null; isAuthenticated: boolean; login: (email: string, password: string) => Promise<void>; logout: () => void; setUser: (user: User) => void; }

export const useAuthStore = create<AuthState>((set) => ({
  user: null, isAuthenticated: !!localStorage.getItem('token'),
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.data.accessToken);
    set({ user: data.data.user, isAuthenticated: true });
  },
  logout: () => { localStorage.removeItem('token'); set({ user: null, isAuthenticated: false }); },
  setUser: (user) => set({ user }),
}));

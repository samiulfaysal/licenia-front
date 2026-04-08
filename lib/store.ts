import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  
  login: (token: string, user: User) => {
    typeof window !== 'undefined' && localStorage.setItem('token', token);
    set({ token, user });
  },

  logout: () => {
    typeof window !== 'undefined' && localStorage.removeItem('token');
    set({ token: null, user: null });
  },

  setUser: (user: User) => {
    set({ user });
  },

  isAuthenticated: () => {
    return get().token !== null;
  },
}));

// Load token from storage on init
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    useAuthStore.setState({ token });
  }
}

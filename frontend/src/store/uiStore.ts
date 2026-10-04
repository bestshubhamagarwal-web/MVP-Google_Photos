import { create } from 'zustand';

interface UiState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  isDrawerOpen: true,
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
}));

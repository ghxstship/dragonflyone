import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { StoreApi, UseBoundStore } from 'zustand';

/**
 * UI State Store
 * Manages global UI state (modals, sidebars, notifications, theme, etc.)
 */
interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Modals
  activeModal: string | null;
  modalData: Record<string, any>;
  
  // Notifications/Toast
  notifications: Notification[];
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;
  
  // Search
  searchOpen: boolean;
  searchQuery: string;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  
  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;
  
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  createdAt: number;
}

export const useUIStore: UseBoundStore<StoreApi<UIState>> = create<UIState>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial state
        sidebarOpen: true,
        sidebarCollapsed: false,
        activeModal: null,
        modalData: {},
        notifications: [],
        theme: 'system',
        globalLoading: false,
        loadingMessage: null,
        searchOpen: false,
        searchQuery: '',

        // Actions
        toggleSidebar: () =>
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          }),

        setSidebarOpen: (open) =>
          set((state) => {
            state.sidebarOpen = open;
          }),

        toggleSidebarCollapse: () =>
          set((state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
          }),

        openModal: (modalId, data = {}) =>
          set((state) => {
            state.activeModal = modalId;
            state.modalData = data;
          }),

        closeModal: () =>
          set((state) => {
            state.activeModal = null;
            state.modalData = {};
          }),

        addNotification: (notification) =>
          set((state) => {
            const newNotification: Notification = {
              ...notification,
              id: Math.random().toString(36).substr(2, 9),
              createdAt: Date.now(),
            };
            state.notifications.push(newNotification);

            // Auto-remove after duration
            if (notification.duration) {
              setTimeout(() => {
                set((state) => {
                  state.notifications = state.notifications.filter(
                    (n) => n.id !== newNotification.id
                  );
                });
              }, notification.duration);
            }
          }),

        removeNotification: (id) =>
          set((state) => {
            state.notifications = state.notifications.filter((n) => n.id !== id);
          }),

        clearNotifications: () =>
          set((state) => {
            state.notifications = [];
          }),

        setTheme: (theme) =>
          set((state) => {
            state.theme = theme;
          }),

        setGlobalLoading: (loading, message) =>
          set((state) => {
            state.globalLoading = loading;
            state.loadingMessage = message ?? null;
          }),

        setSearchOpen: (open) =>
          set((state) => {
            state.searchOpen = open;
          }),

        setSearchQuery: (query) =>
          set((state) => {
            state.searchQuery = query;
          }),
      })),
      {
        name: 'ghxstship-ui-store',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          theme: state.theme,
        }),
      }
    ),
    { name: 'UI Store' }
  )
);

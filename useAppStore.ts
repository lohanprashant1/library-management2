import { create } from 'zustand';

export type Page =
  | 'home'
  | 'catalog'
  | 'register'
  | 'login'
  | 'about'
  | 'contact'
  | 'admin-dashboard'
  | 'admin-books'
  | 'admin-members'
  | 'admin-categories'
  | 'admin-authors'
  | 'admin-transactions'
  | 'admin-settings'
  | 'admin-events'
  | 'admin-ebooks'
  | 'admin-faqs'
  | 'admin-staff'
  | 'admin-services'
  | 'admin-suggestions'
  | 'admin-feedback'
  | 'admin-deploy'
  | 'admin-donors'
  | 'admin-new-arrivals'
  | 'admin-eresources'
  | 'admin-notices'
  | 'admin-ask-librarian'
  | 'admin-faculty-publications'
  | 'admin-past-papers'
  | 'admin-library-rules'
  | 'admin-photo-gallery'
  | 'admin-newsletters'
  | 'admin-committee'
  | 'admin-research-guides'
  | 'admin-cas-alerts'
  | 'admin-ill-requests'
  | 'ebooks'
  | 'events'
  | 'faqs'
  | 'services'
  | 'suggest-book'
  | 'feedback'
  | 'staff'
  | 'donors'
  | 'new-arrivals'
  | 'eresources'
  | 'notices'
  | 'ask-librarian'
  | 'faculty-publications'
  | 'past-papers'
  | 'library-rules'
  | 'photo-gallery'
  | 'newsletters'
  | 'committee'
  | 'research-guides'
  | 'cas-alerts'
  | 'ill-request';

interface AppState {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  adminUser: { id: string; username: string; name: string } | null;
  setAdminUser: (user: { id: string; username: string; name: string } | null) => void;
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'home',
  setCurrentPage: (page) => set({ currentPage: page }),
  isAdmin: false,
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  adminUser: null,
  setAdminUser: (user) => set({ adminUser: user }),
  adminToken: null,
  setAdminToken: (token) => set({ adminToken: token }),
  logout: () =>
    set({
      isAdmin: false,
      adminUser: null,
      adminToken: null,
      currentPage: 'home',
    }),
}));

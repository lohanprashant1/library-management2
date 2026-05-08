'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useAppStore, Page } from '@/store/useAppStore';

// Admin components
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardPage from '@/components/admin/DashboardPage';
import BooksPage from '@/components/admin/BooksPage';
import MembersPage from '@/components/admin/MembersPage';
import CategoriesPage from '@/components/admin/CategoriesPage';
import AuthorsPage from '@/components/admin/AuthorsPage';
import TransactionsPage from '@/components/admin/TransactionsPage';
import SettingsPage from '@/components/admin/SettingsPage';
import LoginGate from '@/components/admin/LoginGate';
import EventsPageAdmin from '@/components/admin/EventsPage';
import EBooksPageAdmin from '@/components/admin/EBooksPage';
import FAQsPageAdmin from '@/components/admin/FAQsPage';
import StaffPageAdmin from '@/components/admin/StaffPage';
import ServicesPageAdmin from '@/components/admin/ServicesPage';
import SuggestionsPage from '@/components/admin/SuggestionsPage';
import FeedbackPageAdmin from '@/components/admin/FeedbackPage';
import DeployGuidePage from '@/components/admin/DeployGuidePage';
import DonorsPageAdmin from '@/components/admin/DonorsPage';
import NewArrivalsPageAdmin from '@/components/admin/NewArrivalsPage';
import EResourcesPageAdmin from '@/components/admin/EResourcesPage';
import NoticesPageAdmin from '@/components/admin/NoticesPage';
import AskLibrarianPageAdmin from '@/components/admin/AskLibrarianPage';
import FacultyPublicationsPageAdmin from '@/components/admin/FacultyPublicationsPage';
import PastPapersPageAdmin from '@/components/admin/PastPapersPage';
import LibraryRulesPageAdmin from '@/components/admin/LibraryRulesPage';
import PhotoGalleryPageAdmin from '@/components/admin/PhotoGalleryPage';
import NewslettersPageAdmin from '@/components/admin/NewslettersPage';
import CommitteePageAdmin from '@/components/admin/CommitteePage';
import ResearchGuidesPageAdmin from '@/components/admin/ResearchGuidesPage';
import CASAlertsPageAdmin from '@/components/admin/CASAlertsPage';
import ILLRequestsPageAdmin from '@/components/admin/ILLRequestsPage';

// Public components
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';
import HomePage from '@/components/public/HomePage';
import CatalogPage from '@/components/public/CatalogPage';
import RegisterPage from '@/components/public/RegisterPage';
import LoginPage from '@/components/public/LoginPage';
import AboutPage from '@/components/public/AboutPage';
import ContactPage from '@/components/public/ContactPage';
import EBooksPage from '@/components/public/EBooksPage';
import EventsPage from '@/components/public/EventsPage';
import FAQsPage from '@/components/public/FAQsPage';
import ServicesPage from '@/components/public/ServicesPage';
import SuggestBookPage from '@/components/public/SuggestBookPage';
import FeedbackPagePublic from '@/components/public/FeedbackPage';
import StaffPage from '@/components/public/StaffPage';
import DonorsPage from '@/components/public/DonorsPage';
import NewArrivalsPage from '@/components/public/NewArrivalsPage';
import EResourcesPage from '@/components/public/EResourcesPage';
import NoticesPage from '@/components/public/NoticesPage';
import AskLibrarianPage from '@/components/public/AskLibrarianPage';
import FacultyPublicationsPage from '@/components/public/FacultyPublicationsPage';
import PastPapersPage from '@/components/public/PastPapersPage';
import LibraryRulesPage from '@/components/public/LibraryRulesPage';
import PhotoGalleryPage from '@/components/public/PhotoGalleryPage';
import NewslettersPage from '@/components/public/NewslettersPage';
import CommitteePage from '@/components/public/CommitteePage';
import ResearchGuidesPage from '@/components/public/ResearchGuidesPage';
import CASAlertsPage from '@/components/public/CASAlertsPage';
import ILLRequestPage from '@/components/public/ILLRequestPage';

function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function AdminRouter() {
  const currentPage = useAppStore((s) => s.currentPage);

  const pageMap: Record<string, React.ReactNode> = {
    'admin-dashboard': <DashboardPage />,
    'admin-books': <BooksPage />,
    'admin-members': <MembersPage />,
    'admin-categories': <CategoriesPage />,
    'admin-authors': <AuthorsPage />,
    'admin-transactions': <TransactionsPage />,
    'admin-settings': <SettingsPage />,
    'admin-events': <EventsPageAdmin />,
    'admin-ebooks': <EBooksPageAdmin />,
    'admin-faqs': <FAQsPageAdmin />,
    'admin-staff': <StaffPageAdmin />,
    'admin-services': <ServicesPageAdmin />,
    'admin-suggestions': <SuggestionsPage />,
    'admin-feedback': <FeedbackPageAdmin />,
    'admin-deploy': <DeployGuidePage />,
    'admin-donors': <DonorsPageAdmin />,
    'admin-new-arrivals': <NewArrivalsPageAdmin />,
    'admin-eresources': <EResourcesPageAdmin />,
    'admin-notices': <NoticesPageAdmin />,
    'admin-ask-librarian': <AskLibrarianPageAdmin />,
    'admin-faculty-publications': <FacultyPublicationsPageAdmin />,
    'admin-past-papers': <PastPapersPageAdmin />,
    'admin-library-rules': <LibraryRulesPageAdmin />,
    'admin-photo-gallery': <PhotoGalleryPageAdmin />,
    'admin-newsletters': <NewslettersPageAdmin />,
    'admin-committee': <CommitteePageAdmin />,
    'admin-research-guides': <ResearchGuidesPageAdmin />,
    'admin-cas-alerts': <CASAlertsPageAdmin />,
    'admin-ill-requests': <ILLRequestsPageAdmin />,
  };

  return <AdminLayout>{pageMap[currentPage] || <DashboardPage />}</AdminLayout>;
}

function PublicRouter() {
  const currentPage = useAppStore((s) => s.currentPage);

  const pageMap: Record<string, React.ReactNode> = {
    home: <HomePage />,
    catalog: <CatalogPage />,
    register: <RegisterPage />,
    login: <LoginPage />,
    about: <AboutPage />,
    contact: <ContactPage />,
    ebooks: <EBooksPage />,
    events: <EventsPage />,
    faqs: <FAQsPage />,
    services: <ServicesPage />,
    'suggest-book': <SuggestBookPage />,
    feedback: <FeedbackPagePublic />,
    staff: <StaffPage />,
    donors: <DonorsPage />,
    'new-arrivals': <NewArrivalsPage />,
    eresources: <EResourcesPage />,
    notices: <NoticesPage />,
    'ask-librarian': <AskLibrarianPage />,
    'faculty-publications': <FacultyPublicationsPage />,
    'past-papers': <PastPapersPage />,
    'library-rules': <LibraryRulesPage />,
    'photo-gallery': <PhotoGalleryPage />,
    newsletters: <NewslettersPage />,
    committee: <CommitteePage />,
    'research-guides': <ResearchGuidesPage />,
    'cas-alerts': <CASAlertsPage />,
    'ill-request': <ILLRequestPage />,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">{pageMap[currentPage] || <HomePage />}</main>
      <PublicFooter />
    </div>
  );
}

export default function Home() {
  const currentPage = useAppStore((s) => s.currentPage);
  const isAdminPage = currentPage.startsWith('admin-');

  if (isAdminPage) {
    return (
      <QueryProvider>
        <LoginGate>
          <AdminRouter />
        </LoginGate>
        <Toaster position="top-right" richColors closeButton />
      </QueryProvider>
    );
  }

  return (
    <QueryProvider>
      <PublicRouter />
      <Toaster position="top-right" richColors closeButton />
    </QueryProvider>
  );
}

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { EventsPage } from './pages/public/EventsPage';
import { EventDetailsPage } from './pages/public/EventDetailsPage';
import { EventRegisterPage } from './pages/public/EventRegisterPage';
import { CategoriesPage } from './pages/public/CategoriesPage';
import { CategoryDetailsPage } from './pages/public/CategoryDetailsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Attendee Pages
import { AttendeeDashboard } from './pages/attendee/AttendeeDashboard';
import { AttendeeBookings } from './pages/attendee/AttendeeBookings';
import { AttendeeProfile } from './pages/attendee/AttendeeProfile';

// Organizer Pages
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard';
import { OrganizerEvents } from './pages/organizer/OrganizerEvents';
import { OrganizerEventForm } from './pages/organizer/OrganizerEventForm';
import { OrganizerAttendees } from './pages/organizer/OrganizerAttendees';
import { OrganizerAnalytics } from './pages/organizer/OrganizerAnalytics';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminEvents } from './pages/admin/AdminEvents';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCategories } from './pages/admin/AdminCategories';

// Utility Pages
import { NotificationsPage } from './pages/utility/NotificationsPage';
import { SettingsPage } from './pages/utility/SettingsPage';
import { NotFoundPage } from './pages/utility/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:eventId" element={<EventDetailsPage />} />
              <Route path="/events/:eventId/register" element={<EventRegisterPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/categories/:slug" element={<CategoryDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Dashboard Layout Routes */}
            {/* Organizer Section */}
            <Route path="/organizer" element={<DashboardLayout title="Events" />}>
              <Route index element={<Navigate to="/organizer/events" replace />} />
              <Route path="dashboard" element={<OrganizerDashboard />} />
              <Route path="events" element={<OrganizerEvents />} />
              <Route path="events/new" element={<OrganizerEventForm />} />
              <Route path="events/:eventId/edit" element={<OrganizerEventForm />} />
              <Route path="events/:eventId/attendees" element={<OrganizerAttendees />} />
              <Route path="analytics" element={<OrganizerAnalytics />} />
            </Route>

            {/* Attendee Section */}
            <Route path="/attendee" element={<DashboardLayout title="My Activity" />}>
              <Route index element={<Navigate to="/attendee/dashboard" replace />} />
              <Route path="dashboard" element={<AttendeeDashboard />} />
              <Route path="bookings" element={<AttendeeBookings />} />
              <Route path="profile" element={<AttendeeProfile />} />
            </Route>

            {/* Admin Section */}
            <Route path="/admin" element={<DashboardLayout title="Administration" />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
            </Route>

            {/* Shared Utility inside Dashboard */}
            <Route element={<DashboardLayout title="EventSphere" />}>
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* 404 Route */}
            <Route element={<PublicLayout />}>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

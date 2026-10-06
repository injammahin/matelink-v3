import {
  Route,
} from 'react-router-dom';

import AdminRoute from '@/modules/admin/guards/AdminRoute';

import AdminLayout from '@/modules/admin/layouts/AdminLayout';

import DashboardPage from '@/modules/admin/pages/DashboardPage';

import BookingsPage from '@/modules/admin/pages/BookingsPage';

import QuotesPage from '@/modules/admin/pages/QuotesPage';

import RecleansPage from '@/modules/admin/pages/RecleansPage';

import PaymentsPage from '@/modules/admin/pages/PaymentsPage';

import ServicesPage from '@/modules/admin/pages/ServicesPage';

import PricingPage from '@/modules/admin/pages/PricingPage';

import PromotionsPage from '@/modules/admin/pages/PromotionsPage';

import SettingsPage from '@/modules/admin/pages/SettingsPage';


export default function AdminRoutes() {
  return (
    <Route
      element={
        <AdminRoute />
      }
    >
      <Route
        path="/admin"
        element={
          <AdminLayout />
        }
      >
        <Route
          index
          element={
            <DashboardPage />
          }
        />

        <Route
          path="bookings"
          element={
            <BookingsPage />
          }
        />

        <Route
          path="quotes"
          element={
            <QuotesPage />
          }
        />

        <Route
          path="recleans"
          element={
            <RecleansPage />
          }
        />

        <Route
          path="payments"
          element={
            <PaymentsPage />
          }
        />

        <Route
          path="services"
          element={
            <ServicesPage />
          }
        />

        <Route
          path="pricing"
          element={
            <PricingPage />
          }
        />

        <Route
          path="promotions"
          element={
            <PromotionsPage />
          }
        />

        <Route
          path="settings"
          element={
            <SettingsPage />
          }
        />
      </Route>
    </Route>
  );
}
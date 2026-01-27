import { createBrowserRouter } from 'react-router-dom';

import Home from '@screens/Home';
import Layout from '@ui/Layout';
import Loading from '@ui/Loading';
import { ProtectedRoute } from '@components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      // Knowledge Base (public)
      {
        path: 'knowledge-base',
        HydrateFallback: Loading,
        lazy: async () => {
          const { KnowledgeBase } = await import('@screens/KnowledgeBase');
          return { Component: KnowledgeBase };
        },
      },
      // About page (lazy loaded)
      {
        path: 'about',
        HydrateFallback: Loading,
        lazy: async () => {
          const { default: About } = await import('@screens/About');
          return { Component: About };
        },
      },
      // Customer Support Routes
      {
        path: 'support',
        HydrateFallback: Loading,
        lazy: async () => {
          const { MySupport } = await import('@screens/support/MySupport');
          return {
            Component: () => (
              <ProtectedRoute>
                <MySupport />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: 'support/submit',
        HydrateFallback: Loading,
        lazy: async () => {
          const { SubmitTicket } = await import('@screens/support/SubmitTicket');
          return {
            Component: () => (
              <ProtectedRoute>
                <SubmitTicket />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: 'support/ticket/:id',
        HydrateFallback: Loading,
        lazy: async () => {
          const { TicketDetail } = await import('@screens/support/TicketDetail');
          return {
            Component: () => (
              <ProtectedRoute>
                <TicketDetail />
              </ProtectedRoute>
            ),
          };
        },
      },
      // Internal Tester Routes
      {
        path: 'testing',
        HydrateFallback: Loading,
        lazy: async () => {
          const { TesterDashboard } = await import('@screens/testing/TesterDashboard');
          return {
            Component: () => (
              <ProtectedRoute requireTester>
                <TesterDashboard />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: 'testing/report',
        HydrateFallback: Loading,
        lazy: async () => {
          const { ReportBug } = await import('@screens/testing/ReportBug');
          return {
            Component: () => (
              <ProtectedRoute requireTester>
                <ReportBug />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: 'testing/bug/:id',
        HydrateFallback: Loading,
        lazy: async () => {
          const { BugDetail } = await import('@screens/testing/BugDetail');
          return {
            Component: () => (
              <ProtectedRoute requireTester>
                <BugDetail />
              </ProtectedRoute>
            ),
          };
        },
      },
      // Admin Routes (protected - nova@moondreams.dev only)
      {
        path: 'admin',
        HydrateFallback: Loading,
        lazy: async () => {
          const { AdminDashboard } = await import('@screens/admin/AdminDashboard');
          return {
            Component: () => (
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: 'admin/apps',
        HydrateFallback: Loading,
        lazy: async () => {
          const { AppRegistry } = await import('@screens/admin/AppRegistry');
          return {
            Component: () => (
              <ProtectedRoute requireAdmin>
                <AppRegistry />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: 'admin/users',
        HydrateFallback: Loading,
        lazy: async () => {
          const { UserManagement } = await import('@screens/admin/UserManagement');
          return {
            Component: () => (
              <ProtectedRoute requireAdmin>
                <UserManagement />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: 'admin/analytics',
        HydrateFallback: Loading,
        lazy: async () => {
          const { Analytics } = await import('@screens/admin/Analytics');
          return {
            Component: () => (
              <ProtectedRoute requireAdmin>
                <Analytics />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: 'admin/audit',
        HydrateFallback: Loading,
        lazy: async () => {
          const { AuditLogViewer } = await import('@screens/admin/AuditLogViewer');
          return {
            Component: () => (
              <ProtectedRoute requireAdmin>
                <AuditLogViewer />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: 'admin/setup',
        HydrateFallback: Loading,
        lazy: async () => {
          const { Setup } = await import('@screens/admin/Setup');
          return {
            Component: () => (
              <ProtectedRoute requireAdmin>
                <Setup />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: 'admin/bulk-actions',
        HydrateFallback: Loading,
        lazy: async () => {
          const { BulkActions } = await import('@screens/admin/BulkActions');
          return {
            Component: () => (
              <ProtectedRoute requireAdmin>
                <BulkActions />
              </ProtectedRoute>
            ),
          };
        },
      },
    ],
  },
]);

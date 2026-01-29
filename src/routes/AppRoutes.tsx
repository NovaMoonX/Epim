import { createBrowserRouter } from 'react-router-dom';

import Home from '@screens/Home';
import Layout from '@ui/Layout';
import { AdminLayout } from '@ui/AdminLayout';
import Loading from '@ui/Loading';
import { SubmitTicket } from '@screens/SubmitTicket';
import { AdminApps } from '@screens/AdminApps';
import { AdminTickets } from '@screens/AdminTickets';
import { AdminLogin } from '@screens/AdminLogin';
import { AdminDashboard } from '@screens/AdminDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'submit-ticket',
        element: <SubmitTicket />,
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
    ],
  },
  // Admin routes
  {
    path: '/admin',
    children: [
      {
        index: true,
        element: <AdminLogin />,
      },
      {
        element: <AdminLayout />,
        children: [
          {
            path: 'dashboard',
            element: <AdminDashboard />,
          },
          {
            path: 'apps',
            element: <AdminApps />,
          },
          {
            path: 'tickets',
            element: <AdminTickets />,
          },
        ],
      },
    ],
  },
]);

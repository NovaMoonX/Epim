import { createBrowserRouter } from 'react-router-dom';

import Home from '@screens/Home';
import Layout from '@ui/Layout';
import Loading from '@ui/Loading';
import { SubmitTicket } from '@screens/SubmitTicket';
import { AdminApps } from '@screens/AdminApps';
import { AdminTickets } from '@screens/AdminTickets';

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
      {
        path: 'admin/apps',
        element: <AdminApps />,
      },
      {
        path: 'admin/tickets',
        element: <AdminTickets />,
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
]);

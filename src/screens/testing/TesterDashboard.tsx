import { useEffect, useState } from 'react';
import { Button, Badge } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';
import { db } from '@lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Ticket, App } from '@lib/types';
import { Link } from 'react-router-dom';

export function TesterDashboard() {
  const { user, isTester } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [apps, setApps] = useState<Record<string, App>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isTester) {
      loadData();
    }
  }, [user, isTester]);

  const loadData = async () => {
    try {
      // Load apps
      const appsSnapshot = await getDocs(collection(db, 'apps'));
      const appsMap: Record<string, App> = {};
      appsSnapshot.forEach((doc) => {
        appsMap[doc.id] = { id: doc.id, ...doc.data() } as App;
      });
      setApps(appsMap);

      // Load user's bug reports
      const ticketsQuery = query(
        collection(db, 'tickets'),
        where('userId', '==', user!.id),
        where('type', '==', 'internal'),
        orderBy('createdAt', 'desc')
      );
      const ticketsSnapshot = await getDocs(ticketsQuery);
      const ticketsData: Ticket[] = [];
      ticketsSnapshot.forEach((doc) => {
        ticketsData.push({ id: doc.id, ...doc.data() } as Ticket);
      });
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error loading bug reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      Open: 'bg-blue-500',
      Pending: 'bg-amber-500',
      Resolved: 'bg-emerald-500',
    };

    return statusColors[status as keyof typeof statusColors] || statusColors.Open;
  };

  const getPriorityColor = (priority: string) => {
    const priorityColors = {
      Blocker: 'bg-rose-500',
      High: 'bg-orange-500',
      Medium: 'bg-yellow-500',
      Low: 'bg-slate-500',
    };

    return priorityColors[priority as keyof typeof priorityColors] || priorityColors.Medium;
  };

  if (!user || !isTester) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-foreground/70">You need tester privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Testing Dashboard</h1>
            <p className="text-foreground/70 mt-1">Your reported bugs and their status</p>
          </div>
          <Link to="/testing/report">
            <Button>Report New Bug</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-foreground/60">Loading bug reports...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-foreground/60 mb-4">You haven't reported any bugs yet.</p>
            <Link to="/testing/report">
              <Button>Report Your First Bug</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/testing/bug/${ticket.id}`}
                className="block bg-muted/30 hover:bg-muted/50 rounded-lg p-6 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{ticket.title}</h3>
                    </div>
                    <p className="text-sm text-foreground/70 mb-3 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge>{ticket.environment}</Badge>
                      {apps[ticket.appId] && (
                        <Badge>{apps[ticket.appId].name}</Badge>
                      )}
                      {ticket.fixedInBuild && (
                        <Badge className="bg-teal-500">Fixed in {ticket.fixedInBuild}</Badge>
                      )}
                    </div>
                    {(ticket.os || ticket.browser || ticket.appVersion) && (
                      <div className="mt-2 text-xs text-foreground/60">
                        {ticket.os && <span className="mr-3">OS: {ticket.os}</span>}
                        {ticket.browser && <span className="mr-3">Browser: {ticket.browser}</span>}
                        {ticket.appVersion && <span>Version: {ticket.appVersion}</span>}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-foreground/60 sm:text-right">
                    <p>Created {ticket.createdAt.toDate().toLocaleDateString()}</p>
                    <p className="text-xs mt-1">
                      ID: {ticket.id.substring(0, 8)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

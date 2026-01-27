import { useEffect, useState } from 'react';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';
import { db } from '@lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Ticket, App } from '@lib/types';
import { useNavigate } from 'react-router-dom';

interface AppStats {
  appId: string;
  appName: string;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResolutionTime: number;
  bugCount: number;
  customerTickets: number;
}

export function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [apps, setApps] = useState<Record<string, App>>({});
  const [appStats, setAppStats] = useState<AppStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email === 'nova@moondreams.dev') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load apps
      const appsSnapshot = await getDocs(collection(db, 'apps'));
      const appsMap: Record<string, App> = {};
      appsSnapshot.forEach((doc) => {
        appsMap[doc.id] = { id: doc.id, ...doc.data() } as App;
      });
      setApps(appsMap);

      // Load tickets
      const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
      const ticketsData: Ticket[] = [];
      ticketsSnapshot.forEach((doc) => {
        ticketsData.push({ id: doc.id, ...doc.data() } as Ticket);
      });
      setTickets(ticketsData);

      // Calculate stats per app
      const statsMap: Record<string, AppStats> = {};

      Object.keys(appsMap).forEach((appId) => {
        const appTickets = ticketsData.filter((t) => t.appId === appId);
        const resolvedTickets = appTickets.filter((t) => t.status === 'Resolved');

        // Calculate average resolution time
        const resolutionTimes = resolvedTickets
          .filter((t) => t.resolvedAt)
          .map((t) => {
            const createdMs = t.createdAt.toMillis();
            const resolvedMs = t.resolvedAt!.toMillis();
            const diffMs = resolvedMs - createdMs;
            const diffHours = diffMs / (1000 * 60 * 60);
            
            return diffHours;
          });

        const avgResolutionTime =
          resolutionTimes.length > 0
            ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
            : 0;

        statsMap[appId] = {
          appId,
          appName: appsMap[appId].name,
          totalTickets: appTickets.length,
          openTickets: appTickets.filter((t) => t.status === 'Open').length,
          resolvedTickets: resolvedTickets.length,
          avgResolutionTime,
          bugCount: appTickets.filter((t) => t.category === 'Bug').length,
          customerTickets: appTickets.filter((t) => t.type === 'customer').length,
        };
      });

      const statsArray = Object.values(statsMap);
      setAppStats(statsArray.sort((a, b) => b.totalTickets - a.totalTickets));
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (hours: number) => {
    if (hours < 24) {
      return `${hours.toFixed(1)} hours`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    return `${days}d ${remainingHours.toFixed(0)}h`;
  };

  if (user?.email !== 'nova@moondreams.dev') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-foreground/70">
            Analytics is restricted to nova@moondreams.dev
          </p>
        </div>
      </div>
    );
  }

  const overallStats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter((t) => t.status === 'Open').length,
    pendingTickets: tickets.filter((t) => t.status === 'Pending').length,
    resolvedTickets: tickets.filter((t) => t.status === 'Resolved').length,
    totalBugs: tickets.filter((t) => t.category === 'Bug').length,
    criticalBugs: tickets.filter(
      (t) => t.category === 'Bug' && (t.priority === 'Blocker' || t.priority === 'High')
    ).length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            ← Back to Admin Dashboard
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Resolution Analytics</h1>
          <p className="text-foreground/70 mt-1">
            Track ticket resolution performance across all apps
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-2xl font-bold">{overallStats.totalTickets}</div>
            <div className="text-sm text-foreground/60">Total Tickets</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-2xl font-bold">{overallStats.openTickets}</div>
            <div className="text-sm text-foreground/60">Open</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-2xl font-bold">{overallStats.pendingTickets}</div>
            <div className="text-sm text-foreground/60">Pending</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-2xl font-bold">{overallStats.resolvedTickets}</div>
            <div className="text-sm text-foreground/60">Resolved</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-2xl font-bold">{overallStats.totalBugs}</div>
            <div className="text-sm text-foreground/60">Total Bugs</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-rose-500">{overallStats.criticalBugs}</div>
            <div className="text-sm text-foreground/60">Critical Bugs</div>
          </div>
        </div>

        {/* Per-App Stats */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Per-App Statistics</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-foreground/60">Loading analytics...</p>
            </div>
          ) : appStats.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-foreground/60">No data available yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appStats.map((stat) => (
                <div key={stat.appId} className="bg-muted/30 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">{stat.appName}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{stat.totalTickets}</div>
                      <div className="text-sm text-foreground/60">Total Tickets</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.openTickets}</div>
                      <div className="text-sm text-foreground/60">Open</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.resolvedTickets}</div>
                      <div className="text-sm text-foreground/60">Resolved</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.bugCount}</div>
                      <div className="text-sm text-foreground/60">Bugs</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.customerTickets}</div>
                      <div className="text-sm text-foreground/60">Customer</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        {stat.avgResolutionTime > 0 ? formatHours(stat.avgResolutionTime) : 'N/A'}
                      </div>
                      <div className="text-sm text-foreground/60">Avg Resolution</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

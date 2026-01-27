import { useEffect, useState } from 'react';
import { Button, Badge, Select, Input } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';
import { db } from '@lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { Ticket, App, User } from '@lib/types';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [apps, setApps] = useState<Record<string, App>>({});
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'customer' | 'internal'>('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());

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

      // Load users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersMap: Record<string, User> = {};
      usersSnapshot.forEach((doc) => {
        usersMap[doc.id] = { id: doc.id, ...doc.data() } as User;
      });
      setUsers(usersMap);

      // Load all tickets
      const ticketsQuery = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
      const ticketsSnapshot = await getDocs(ticketsQuery);
      const ticketsData: Ticket[] = [];
      ticketsSnapshot.forEach((doc) => {
        ticketsData.push({ id: doc.id, ...doc.data() } as Ticket);
      });
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesType = filterType === 'all' || ticket.type === filterType;
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  const toggleTicketSelection = (ticketId: string) => {
    const newSelection = new Set(selectedTickets);
    if (newSelection.has(ticketId)) {
      newSelection.delete(ticketId);
    } else {
      newSelection.add(ticketId);
    }
    setSelectedTickets(newSelection);
  };

  const selectAll = () => {
    if (selectedTickets.size === filteredTickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(filteredTickets.map((t) => t.id)));
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

  const stats = {
    total: tickets.length,
    customer: tickets.filter((t) => t.type === 'customer').length,
    internal: tickets.filter((t) => t.type === 'internal').length,
    open: tickets.filter((t) => t.status === 'Open').length,
    pending: tickets.filter((t) => t.status === 'Pending').length,
    resolved: tickets.filter((t) => t.status === 'Resolved').length,
  };

  if (user?.email !== 'nova@moondreams.dev') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-foreground/70">
            Admin dashboard is restricted to nova@moondreams.dev
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-foreground/70 mt-1">Global command center for all tickets</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/apps">
              <Button variant="outline">App Registry</Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="outline">User Management</Button>
            </Link>
            <Link to="/admin/analytics">
              <Button variant="outline">Analytics</Button>
            </Link>
            <Link to="/admin/audit">
              <Button variant="outline">Audit Log</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-foreground/60">Total Tickets</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-2xl font-bold">{stats.customer}</div>
            <div className="text-sm text-foreground/60">Customer</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-2xl font-bold">{stats.internal}</div>
            <div className="text-sm text-foreground/60">Internal</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-2xl font-bold">{stats.open}</div>
            <div className="text-sm text-foreground/60">Open</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-sm text-foreground/60">Pending</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <div className="text-sm text-foreground/60">Resolved</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              placeholder="Search by ID, email, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select
              value={filterType}
              onChange={(value) => setFilterType(value as typeof filterType)}
              options={[
                { value: 'all', text: 'All Types' },
                { value: 'customer', text: 'Customer Support' },
                { value: 'internal', text: 'Internal Testing' },
              ]}
            />
            <Select
              value={filterStatus}
              onChange={(value) => setFilterStatus(value)}
              options={[
                { value: 'all', text: 'All Statuses' },
                { value: 'Open', text: 'Open' },
                { value: 'Pending', text: 'Pending' },
                { value: 'Resolved', text: 'Resolved' },
              ]}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTickets.size > 0 && (
          <div className="bg-primary/10 border border-primary rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {selectedTickets.size} ticket(s) selected
              </span>
              <div className="flex gap-2">
                <Link to={`/admin/bulk-actions?tickets=${Array.from(selectedTickets).join(',')}`}>
                  <Button size="sm">Bulk Update Status</Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTickets(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tickets List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-foreground/60">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-foreground/60">No tickets found matching your filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2 px-2">
              <input
                type="checkbox"
                checked={selectedTickets.size === filteredTickets.length}
                onChange={selectAll}
                className="cursor-pointer"
              />
              <span className="text-sm text-foreground/60">Select All</span>
            </div>
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-muted/30 hover:bg-muted/50 rounded-lg p-4 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedTickets.has(ticket.id)}
                    onChange={() => toggleTicketSelection(ticket.id)}
                    className="mt-1 cursor-pointer"
                  />
                  <Link
                    to={
                      ticket.type === 'customer'
                        ? `/support/ticket/${ticket.id}`
                        : `/testing/bug/${ticket.id}`
                    }
                    className="flex-1"
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
                          <Badge
                            className={
                              ticket.type === 'customer'
                                ? 'bg-blue-500/20'
                                : 'bg-purple-500/20'
                            }
                          >
                            {ticket.type === 'customer' ? 'Customer' : 'Internal'}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge>{ticket.category}</Badge>
                          {apps[ticket.appId] && (
                            <Badge>{apps[ticket.appId].name}</Badge>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-foreground/60">
                          {ticket.userName} ({ticket.userEmail})
                        </div>
                      </div>
                      <div className="text-sm text-foreground/60 sm:text-right">
                        <p>Created {ticket.createdAt.toDate().toLocaleDateString()}</p>
                        <p className="text-xs mt-1">ID: {ticket.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

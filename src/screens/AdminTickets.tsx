import { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuthHook';
import { getTickets, getApps, deleteTicket, updateTicket } from '@lib/firebase';
import type { Ticket, App } from '@lib/firebase';
import { Card } from '@moondreamsdev/dreamer-ui/components';
import { Select } from '@moondreamsdev/dreamer-ui/components';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Badge } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { useActionModal } from '@moondreamsdev/dreamer-ui/hooks';

export function AdminTickets() {
  const { isAdmin } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useActionModal();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [selectedAppId]);

  async function loadData() {
    try {
      const [ticketsData, appsData] = await Promise.all([
        getTickets(selectedAppId || undefined),
        getApps(),
      ]);
      setTickets(ticketsData);
      setApps(appsData);
    } catch (error) {
      addToast({ title: 'Failed to load tickets', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(ticketId: string, status: string) {
    try {
      await updateTicket(ticketId, { status: status as Ticket['status'] });
      addToast({ title: 'Ticket status updated', type: 'success' });
      loadData();
    } catch (error) {
      addToast({ title: 'Failed to update ticket', type: 'error' });
    }
  }

  async function handleDelete(ticket: Ticket) {
    const confirmed = await confirm({
      title: 'Delete Ticket',
      message: `Are you sure you want to delete this ticket? This action cannot be undone.`,
      confirmText: 'Delete',
      destructive: true,
    });

    if (confirmed) {
      try {
        if (ticket.id) {
          await deleteTicket(ticket.id);
          addToast({ title: 'Ticket deleted successfully', type: 'success' });
          loadData();
        }
      } catch (error) {
        addToast({ title: 'Failed to delete ticket', type: 'error' });
      }
    }
  }

  if (!isAdmin) {
    return (
      <div className="page flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
          <p className="text-foreground/70">You must be an admin to access this page.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page flex items-center justify-center">
        <p className="text-foreground/70">Loading...</p>
      </div>
    );
  }

  const appOptions = [
    { text: 'All Apps', value: '' },
    ...apps.map((app) => ({ text: app.name, value: app.id || '' })),
  ];

  return (
    <div className="page p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Ticket Feed</h1>
        </div>

        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium">Filter by App:</label>
          <Select
            value={selectedAppId}
            onChange={(value: string) => setSelectedAppId(value)}
            options={appOptions}
            placeholder="All Apps"
            className="w-64"
          />
        </div>

        <div className="space-y-3">
          {tickets.map((ticket) => {
            const createdDate = ticket.createdAt
              ? new Date(ticket.createdAt).toLocaleString()
              : 'N/A';

            const statusOptions = [
              { text: 'Open', value: 'open' },
              { text: 'In Progress', value: 'in-progress' },
              { text: 'Resolved', value: 'resolved' },
            ];

            return (
              <Card key={ticket.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{ticket.subject}</h3>
                      {ticket.followUp && (
                        <Badge variant="accent">Follow-up Requested</Badge>
                      )}
                      <Badge
                        variant={
                          ticket.status === 'resolved'
                            ? 'success'
                            : ticket.status === 'in-progress'
                              ? 'warning'
                              : 'primary'
                        }
                      >
                        {ticket.status || 'open'}
                      </Badge>
                    </div>

                    <p className="text-foreground/80">{ticket.description}</p>

                    <div className="flex gap-4 text-sm text-foreground/60">
                      <span>App: {ticket.appName || 'Unknown'}</span>
                      <span>From: {ticket.creatorEmail}</span>
                      <span>Created: {createdDate}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Select
                      value={ticket.status || 'open'}
                      onChange={(value: string) => ticket.id && handleStatusChange(ticket.id, value)}
                      options={statusOptions}
                      className="w-40"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(ticket)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {tickets.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-foreground/70">
              {selectedAppId ? 'No tickets for this app.' : 'No tickets submitted yet.'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

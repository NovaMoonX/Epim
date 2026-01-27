import { useState, useEffect } from 'react';
import { Button, Select } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';
import { db } from '@lib/firebase';
import { doc, getDoc, updateDoc, Timestamp, addDoc, collection } from 'firebase/firestore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Ticket, TicketStatus } from '@lib/types';

export function BulkActions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newStatus, setNewStatus] = useState<TicketStatus>('Pending');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const ticketIds = searchParams.get('tickets')?.split(',') || [];

  useEffect(() => {
    if (user?.email === 'nova@moondreams.dev' && ticketIds.length > 0) {
      loadTickets();
    }
  }, [user, ticketIds]);

  const loadTickets = async () => {
    try {
      const ticketsData: Ticket[] = [];
      for (const id of ticketIds) {
        const ticketDoc = await getDoc(doc(db, 'tickets', id));
        if (ticketDoc.exists()) {
          ticketsData.push({ id: ticketDoc.id, ...ticketDoc.data() } as Ticket);
        }
      }
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const updatePromises = tickets.map(async (ticket) => {
        const ticketRef = doc(db, 'tickets', ticket.id);
        const updates: Record<string, unknown> = {
          status: newStatus,
          updatedAt: Timestamp.now(),
        };

        if (newStatus === 'Resolved' && !ticket.resolvedAt) {
          updates.resolvedAt = Timestamp.now();
        }

        await updateDoc(ticketRef, updates);

        // Create audit log
        await addDoc(collection(db, 'auditLogs'), {
          ticketId: ticket.id,
          userId: user.id,
          userEmail: user.email,
          action: 'Bulk status update',
          oldValue: ticket.status,
          newValue: newStatus,
          timestamp: Timestamp.now(),
        });
      });

      await Promise.all(updatePromises);
      navigate('/admin');
    } catch (error) {
      console.error('Error updating tickets:', error);
      alert('Failed to update tickets. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (user?.email !== 'nova@moondreams.dev') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-foreground/70">
            Bulk actions are restricted to nova@moondreams.dev
          </p>
        </div>
      </div>
    );
  }

  const statusOptions = [
    { value: 'Open', text: 'Open' },
    { value: 'Pending', text: 'Pending' },
    { value: 'Resolved', text: 'Resolved' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            ← Back to Admin Dashboard
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-6">Bulk Status Update</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-foreground/60">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-foreground/60">No tickets selected.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-muted/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Selected Tickets ({tickets.length})
              </h2>
              <div className="space-y-2">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 bg-background/50 rounded">
                    <div>
                      <p className="font-medium">{ticket.title}</p>
                      <p className="text-sm text-foreground/60">ID: {ticket.id.substring(0, 8)}</p>
                    </div>
                    <span className="text-sm">Current: {ticket.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Update Status</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">New Status</label>
                  <Select
                    options={statusOptions}
                    value={newStatus}
                    onChange={(value) => setNewStatus(value as TicketStatus)}
                  />
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleBulkUpdate} disabled={updating}>
                    {updating ? 'Updating...' : `Update ${tickets.length} Ticket(s)`}
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/admin')}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

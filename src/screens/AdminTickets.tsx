import { useState, useEffect, useCallback } from 'react';
import { getTickets, getProducts, deleteTicket, updateTicket } from '@lib/firebase';
import type { Ticket, Product } from '@lib/firebase';
import { Card } from '@moondreamsdev/dreamer-ui/components';
import { Select } from '@moondreamsdev/dreamer-ui/components';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Badge } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { useActionModal } from '@moondreamsdev/dreamer-ui/hooks';

const CATEGORY_LABELS: Record<string, string> = {
  'general-question': 'General Question',
  'bug': 'Bug / Broken',
  'feature-request': 'Feature Request',
  'financial': 'Financial',
};

export function AdminTickets() {
  const { addToast } = useToast();
  const { confirm } = useActionModal();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const getProductName = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown';
  }, [products]);

  const loadData = useCallback(async () => {
    try {
      const [ticketsData, productsData] = await Promise.all([
        getTickets(selectedProductId || undefined),
        getProducts(),
      ]);
      setTickets(ticketsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
      addToast({ title: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedProductId, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleStatusChange(ticketId: string, status: string) {
    // Validate status value
    const validStatuses = ['open', 'in-progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      addToast({ title: 'Invalid status value', type: 'error' });
      return;
    }

    try {
      await updateTicket(ticketId, { status: status as Ticket['status'] });
      addToast({ title: 'Ticket status updated', type: 'success' });
      loadData();
    } catch {
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
      } catch {
        addToast({ title: 'Failed to delete ticket', type: 'error' });
      }
    }
  }

  if (loading) {
    return (
      <div className="page flex items-center justify-center">
        <p className="text-foreground/70">Loading...</p>
      </div>
    );
  }

  const productOptions = [
    { text: 'All Products', value: '' },
    ...products.map((product) => ({ text: product.name, value: product.id || '' })),
  ];

  return (
    <div className="page p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Ticket Feed</h1>
        </div>

        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium">Filter by Product:</label>
          <Select
            value={selectedProductId}
            onChange={(value: string) => setSelectedProductId(value)}
            options={productOptions}
            placeholder="All Products"
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold">{ticket.subject}</h3>
                      <Badge variant="secondary">
                        {CATEGORY_LABELS[ticket.category] || ticket.category}
                      </Badge>
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
                      <span>Product: {getProductName(ticket.productId)}</span>
                      {ticket.creatorName ? (
                        <>
                          <span>From: {ticket.creatorName}</span>
                          <span>Email: {ticket.creatorEmail}</span>
                        </>
                      ) : (
                        <span>From: {ticket.creatorEmail}</span>
                      )}
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
              {selectedProductId ? 'No tickets for this product.' : 'No tickets submitted yet.'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { getProducts, createTicket } from '@lib/firebase';
import type { Product, TicketCategory } from '@lib/firebase';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { Textarea } from '@moondreamsdev/dreamer-ui/components';
import { Select } from '@moondreamsdev/dreamer-ui/components';
import { Checkbox } from '@moondreamsdev/dreamer-ui/components';
import { Card } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';

const SUPPORT_EMAIL = 'support@moondreams.dev';

const CATEGORY_OPTIONS = [
  { text: 'General Question', value: 'general-question' },
  { text: 'Bug / Broken', value: 'bug' },
  { text: 'Feature Request', value: 'feature-request' },
  { text: 'Financial', value: 'financial' },
];

const INITIAL_FORM_DATA = {
  productId: '',
  category: '' as TicketCategory | '',
  subject: '',
  description: '',
  creatorName: '',
  creatorEmail: '',
  followUp: false,
};

export function SubmitTicket() {
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      addToast({ title: 'Failed to load products', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const resetFormData = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
  }, []);

  async function copyEmailToClipboard() {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      addToast({ title: 'Email copied to clipboard!', type: 'success' });
    } catch {
      addToast({ title: 'Failed to copy email', type: 'error' });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.productId) {
      addToast({ title: 'Please select a product', type: 'warning' });
      return;
    }

    if (!formData.category) {
      addToast({ title: 'Please select a category', type: 'warning' });
      return;
    }

    const selectedProduct = products.find(
      (product) => product.id === formData.productId,
    );

    if (!selectedProduct) {
      addToast({ title: 'Selected product not found', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      await createTicket({
        productId: formData.productId,
        category: formData.category as TicketCategory,
        subject: formData.subject,
        description: formData.description,
        creatorName: formData.creatorName,
        creatorEmail: formData.creatorEmail,
        followUp: formData.followUp,
      });

      addToast({ title: 'Ticket submitted successfully!', type: 'success' });
      resetFormData();
    } catch {
      addToast({ title: 'Failed to submit ticket', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className='page flex items-center justify-center'>
        <p className='text-foreground/70'>Loading...</p>
      </div>
    );
  }

  const productOptions = products.map((product) => ({
    text: product.name,
    value: product.id || '',
  }));

  return (
    <div className='page p-6'>
      <div className='mx-auto max-w-2xl space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-primary text-4xl font-bold'>
            Submit a Support Ticket
          </h1>
          <p className='text-foreground/70'>
            Need help? Fill out the form below and we'll get back to you.
          </p>
        </div>

        <Card className='p-6'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='mb-2 block text-sm font-medium'>
                Product <span className='text-destructive'>*</span>
              </label>
              <Select
                value={formData.productId}
                onChange={(value: string) =>
                  setFormData({ ...formData, productId: value })
                }
                options={productOptions}
                placeholder='Select a product'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>
                Category <span className='text-destructive'>*</span>
              </label>
              <Select
                value={formData.category}
                onChange={(value: string) =>
                  setFormData({
                    ...formData,
                    category: value as TicketCategory,
                  })
                }
                options={CATEGORY_OPTIONS}
                placeholder='Select a category'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>
                Subject <span className='text-destructive'>*</span>
              </label>
              <Input
                type='text'
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder='Brief summary of your issue'
                required
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>
                Description <span className='text-destructive'>*</span>
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='Provide detailed information about your issue'
                rows={6}
                required
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>
                Your Name <span className='text-destructive'>*</span>
              </label>
              <Input
                type='text'
                value={formData.creatorName}
                onChange={(e) =>
                  setFormData({ ...formData, creatorName: e.target.value })
                }
                placeholder='What should we call you?'
                required
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>
                Your Email <span className='text-destructive'>*</span>
              </label>
              <Input
                type='email'
                value={formData.creatorEmail}
                onChange={(e) =>
                  setFormData({ ...formData, creatorEmail: e.target.value })
                }
                placeholder='your.email@example.com'
                required
              />
            </div>

            <div className='flex items-center gap-2'>
              <Checkbox
                checked={formData.followUp}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, followUp: checked === true })
                }
              />
              <label className='text-sm'>
                I would like a follow-up on this ticket
              </label>
            </div>

            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() =>
                  setFormData({
                    productId: '',
                    category: '',
                    subject: '',
                    description: '',
                    creatorName: '',
                    creatorEmail: '',
                    followUp: false,
                  })
                }
              >
                Clear
              </Button>
              <Button type='submit' disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </div>
          </form>
        </Card>

        {products.length === 0 && (
          <Card className='bg-primary/5 border-primary/20 p-6 text-center'>
            <h3 className='text-foreground mb-3 text-lg font-semibold'>
              No products available at the moment
            </h3>
            <p className='text-foreground/70 mb-4'>
              Please contact our support team directly for assistance:
            </p>
            <div className='flex items-center justify-center gap-3'>
              <code className='bg-background border-border text-primary rounded border px-4 py-2 font-mono text-sm'>
                {SUPPORT_EMAIL}
              </code>
              <Button
                onClick={copyEmailToClipboard}
                variant='outline'
                size='sm'
              >
                Copy
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

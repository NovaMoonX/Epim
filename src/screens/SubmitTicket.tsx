import { useState, useEffect } from 'react';
import { getApps, createTicket } from '@lib/firebase';
import type { App } from '@lib/firebase';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { Textarea } from '@moondreamsdev/dreamer-ui/components';
import { Select } from '@moondreamsdev/dreamer-ui/components';
import { Checkbox } from '@moondreamsdev/dreamer-ui/components';
import { Card } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';

export function SubmitTicket() {
  const { addToast } = useToast();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    appId: '',
    subject: '',
    description: '',
    creatorEmail: '',
    followUp: false,
  });

  useEffect(() => {
    loadApps();
  }, []);

  async function loadApps() {
    try {
      const data = await getApps();
      setApps(data);
    } catch (error) {
      addToast({ title: 'Failed to load apps', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.appId) {
      addToast({ title: 'Please select an app', type: 'warning' });
      return;
    }

    const selectedApp = apps.find((app) => app.id === formData.appId);

    setSubmitting(true);
    try {
      await createTicket({
        appId: formData.appId,
        appName: selectedApp?.name || '',
        subject: formData.subject,
        description: formData.description,
        creatorEmail: formData.creatorEmail,
        followUp: formData.followUp,
      });

      addToast({ title: 'Ticket submitted successfully!', type: 'success' });

      // Reset form
      setFormData({
        appId: '',
        subject: '',
        description: '',
        creatorEmail: '',
        followUp: false,
      });
    } catch (error) {
      addToast({ title: 'Failed to submit ticket', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page flex items-center justify-center">
        <p className="text-foreground/70">Loading...</p>
      </div>
    );
  }

  const appOptions = apps.map((app) => ({ text: app.name, value: app.id || '' }));

  return (
    <div className="page p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">Submit a Support Ticket</h1>
          <p className="text-foreground/70">
            Need help? Fill out the form below and we'll get back to you.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                App <span className="text-destructive">*</span>
              </label>
              <Select
                value={formData.appId}
                onChange={(value: string) => setFormData({ ...formData, appId: value })}
                options={appOptions}
                placeholder="Select an app"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Subject <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief summary of your issue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed information about your issue"
                rows={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your Email <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                value={formData.creatorEmail}
                onChange={(e) => setFormData({ ...formData, creatorEmail: e.target.value })}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.followUp}
                onCheckedChange={(checked) => setFormData({ ...formData, followUp: checked === true })}
              />
              <label className="text-sm">I would like a follow-up on this ticket</label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({
                    appId: '',
                    subject: '',
                    description: '',
                    creatorEmail: '',
                    followUp: false,
                  })
                }
              >
                Clear
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </div>
          </form>
        </Card>

        {apps.length === 0 && (
          <Card className="p-6 text-center bg-warning/10">
            <p className="text-foreground/70">
              No apps available. Please contact support directly.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

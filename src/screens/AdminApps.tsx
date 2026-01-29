import { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuthHook';
import { getApps, createApp, updateApp, deleteApp } from '@lib/firebase';
import type { App } from '@lib/firebase';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { Card } from '@moondreamsdev/dreamer-ui/components';
import { Modal } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { useActionModal } from '@moondreamsdev/dreamer-ui/hooks';

export function AdminApps() {
  const { isAdmin } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useActionModal();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [appName, setAppName] = useState('');

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

    if (!appName.trim()) {
      addToast({ title: 'App name is required', type: 'warning' });
      return;
    }

    try {
      if (editingApp?.id) {
        await updateApp(editingApp.id, { name: appName });
        addToast({ title: 'App updated successfully', type: 'success' });
      } else {
        await createApp({ name: appName });
        addToast({ title: 'App created successfully', type: 'success' });
      }
      setShowModal(false);
      setAppName('');
      setEditingApp(null);
      loadApps();
    } catch (error) {
      addToast({ title: 'Failed to save app', type: 'error' });
    }
  }

  function handleEdit(app: App) {
    setEditingApp(app);
    setAppName(app.name);
    setShowModal(true);
  }

  async function handleDelete(app: App) {
    const confirmed = await confirm({
      title: 'Delete App',
      message: `Are you sure you want to delete "${app.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      destructive: true,
    });

    if (confirmed) {
      try {
        if (app.id) {
          await deleteApp(app.id);
          addToast({ title: 'App deleted successfully', type: 'success' });
          loadApps();
        }
      } catch (error) {
        addToast({ title: 'Failed to delete app', type: 'error' });
      }
    }
  }

  function handleCloseModal() {
    setShowModal(false);
    setAppName('');
    setEditingApp(null);
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

  return (
    <div className="page p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">App Management</h1>
          <Button onClick={() => setShowModal(true)}>Create App</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => {
            const createdDate = app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A';
            
            return (
              <Card key={app.id} className="p-4">
                <h3 className="text-lg font-semibold mb-2">{app.name}</h3>
                <p className="text-sm text-foreground/60 mb-4">Created: {createdDate}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(app)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(app)}>
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {apps.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-foreground/70">No apps yet. Create your first app to get started!</p>
          </Card>
        )}
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{editingApp ? 'Edit App' : 'Create App'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">App Name</label>
              <Input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="Enter app name"
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">{editingApp ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

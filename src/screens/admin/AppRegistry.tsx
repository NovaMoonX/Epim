import { useEffect, useState } from 'react';
import { Button, Input } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';
import { db } from '@lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { App } from '@lib/types';
import { useNavigate } from 'react-router-dom';

export function AppRegistry() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    apiKey: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.email === 'nova@moondreams.dev') {
      loadApps();
    }
  }, [user]);

  const loadApps = async () => {
    try {
      const appsSnapshot = await getDocs(collection(db, 'apps'));
      const appsData: App[] = [];
      appsSnapshot.forEach((doc) => {
        appsData.push({ id: doc.id, ...doc.data() } as App);
      });
      setApps(appsData);
    } catch (error) {
      console.error('Error loading apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'apps'), {
        name: formData.name,
        apiKey: formData.apiKey || generateApiKey(),
        createdAt: Timestamp.now(),
        createdBy: user.email,
      });

      setFormData({ name: '', apiKey: '' });
      setShowAddForm(false);
      await loadApps();
    } catch (error) {
      console.error('Error adding app:', error);
      alert('Failed to add app. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!confirm('Are you sure you want to delete this app? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'apps', appId));
      await loadApps();
    } catch (error) {
      console.error('Error deleting app:', error);
      alert('Failed to delete app. Please try again.');
    }
  };

  const generateApiKey = () => {
    return 'app_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  if (user?.email !== 'nova@moondreams.dev') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-foreground/70">
            App Registry is restricted to nova@moondreams.dev
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            ← Back to Admin Dashboard
          </Button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">App Registry</h1>
            <p className="text-foreground/70 mt-1">
              Manage all apps in the ecosystem (supports infinite apps)
            </p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : 'Add New App'}
          </Button>
        </div>

        {showAddForm && (
          <div className="bg-muted/30 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Add New App</h2>
            <form onSubmit={handleAddApp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">App Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., My Awesome App"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  API Key (optional - auto-generated if empty)
                </label>
                <Input
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="app_xxxxxxxxxxxxx"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add App'}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-foreground/60">Loading apps...</p>
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-foreground/60 mb-4">No apps registered yet.</p>
            <Button onClick={() => setShowAddForm(true)}>Add Your First App</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <div
                key={app.id}
                className="bg-muted/30 rounded-lg p-6 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{app.name}</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground/60">App ID:</span>
                        <code className="bg-background/50 px-2 py-1 rounded">
                          {app.id}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground/60">API Key:</span>
                        <code className="bg-background/50 px-2 py-1 rounded">
                          {app.apiKey}
                        </code>
                      </div>
                      <div>
                        <span className="text-foreground/60">
                          Created: {app.createdAt.toDate().toLocaleDateString()} by{' '}
                          {app.createdBy}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteApp(app.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';
import { seedSampleData } from '@lib/firebase/seedData';
import { useNavigate } from 'react-router-dom';

export function Setup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSeedData = async () => {
    setLoading(true);
    setResult(null);
    try {
      await seedSampleData();
      setResult('Sample data seeded successfully! You can now navigate to other pages.');
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (user?.email !== 'nova@moondreams.dev') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-foreground/70">
            Setup page is restricted to nova@moondreams.dev
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            ← Back to Admin Dashboard
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-6">Database Setup</h1>

        <div className="bg-muted/30 rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Seed Sample Data</h2>
            <p className="text-foreground/70 mb-4">
              This will create sample apps and FAQ entries in your database. 
              Run this once after initial setup.
            </p>
            <Button onClick={handleSeedData} disabled={loading}>
              {loading ? 'Seeding...' : 'Seed Sample Data'}
            </Button>
          </div>

          {result && (
            <div className={`p-4 rounded-lg ${result.startsWith('Error') ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
              {result}
            </div>
          )}

          <div className="border-t border-border pt-6">
            <h2 className="text-xl font-semibold mb-2">Quick Links</h2>
            <div className="space-y-2">
              <Button variant="outline" onClick={() => navigate('/admin/apps')} className="w-full">
                Go to App Registry
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin/users')} className="w-full">
                Go to User Management
              </Button>
              <Button variant="outline" onClick={() => navigate('/knowledge-base')} className="w-full">
                View Knowledge Base
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-xl font-semibold mb-2">Next Steps</h2>
            <ol className="list-decimal list-inside space-y-2 text-foreground/70">
              <li>Add more apps in the App Registry</li>
              <li>Promote users to Tester role in User Management</li>
              <li>Create FAQ entries in the Knowledge Base</li>
              <li>Test ticket submission flow</li>
              <li>Test bug reporting flow</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

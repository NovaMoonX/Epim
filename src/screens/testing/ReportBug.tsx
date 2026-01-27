import { useState, useEffect } from 'react';
import { Button, Input, Textarea, Select } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';
import { db, storage } from '@lib/firebase';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { App, TicketPriority, Environment } from '@lib/types';
import { join } from '@moondreamsdev/dreamer-ui/utils';

export function ReportBug() {
  const { user, isTester } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(false);
  const [logFile, setLogFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    appId: '',
    title: '',
    description: '',
    priority: 'Medium' as TicketPriority,
    os: '',
    browser: '',
    appVersion: '',
    environment: 'Production' as Environment,
  });

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    const querySnapshot = await getDocs(collection(db, 'apps'));
    const appsData: App[] = [];
    querySnapshot.forEach((doc) => {
      appsData.push({ id: doc.id, ...doc.data() } as App);
    });
    setApps(appsData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogFile(e.target.files[0]);
    }
  };

  const uploadLogFile = async (): Promise<string | undefined> => {
    if (!logFile) return undefined;

    const storageRef = ref(storage, `logs/${user!.id}/${Date.now()}_${logFile.name}`);
    const snapshot = await uploadBytes(storageRef, logFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isTester) return;

    setLoading(true);
    try {
      // Upload log file if present
      const logFileUrl = logFile ? await uploadLogFile() : undefined;

      // Create bug report ticket
      const ticketRef = await addDoc(collection(db, 'tickets'), {
        type: 'internal',
        appId: formData.appId,
        userId: user.id,
        userEmail: user.email,
        userName: user.displayName,
        title: formData.title,
        description: formData.description,
        category: 'Bug',
        priority: formData.priority,
        status: 'Open',
        os: formData.os,
        browser: formData.browser,
        appVersion: formData.appVersion,
        environment: formData.environment,
        logFileUrl,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Create audit log
      await addDoc(collection(db, 'auditLogs'), {
        ticketId: ticketRef.id,
        userId: user.id,
        userEmail: user.email,
        action: 'Created bug report',
        timestamp: Timestamp.now(),
      });

      // TODO: Send webhook notification for Critical/Blocker bugs
      if (formData.priority === 'Blocker') {
        console.log('Would send webhook notification for blocker bug');
      }

      navigate('/testing');
    } catch (error) {
      console.error('Error submitting bug report:', error);
      alert('Failed to submit bug report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isTester) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-foreground/70">You need tester privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Report a Bug</h1>
        <p className="text-foreground/70 mb-6">Internal bug reporting for testers and developers</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select App *</label>
            <Select
              options={apps.map((app) => ({
                value: app.id,
                text: app.name,
              }))}
              value={formData.appId}
              onChange={(value) => setFormData({ ...formData, appId: value })}
              placeholder="Choose an app"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Priority *</label>
              <Select
                options={[
                  { value: 'Low', text: 'Low' },
                  { value: 'Medium', text: 'Medium' },
                  { value: 'High', text: 'High' },
                  { value: 'Blocker', text: 'Blocker' },
                ]}
                value={formData.priority}
                onChange={(value) => setFormData({ ...formData, priority: value as TicketPriority })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Environment *</label>
              <Select
                options={[
                  { value: 'Staging', text: 'Staging' },
                  { value: 'Production', text: 'Production' },
                ]}
                value={formData.environment}
                onChange={(value) => setFormData({ ...formData, environment: value as Environment })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Operating System</label>
              <Input
                value={formData.os}
                onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                placeholder="e.g., macOS 14.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Browser/Device</label>
              <Input
                value={formData.browser}
                onChange={(e) => setFormData({ ...formData, browser: e.target.value })}
                placeholder="e.g., Chrome 120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">App Version</label>
              <Input
                value={formData.appVersion}
                onChange={(e) => setFormData({ ...formData, appVersion: e.target.value })}
                placeholder="e.g., v2.1.0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bug Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief summary of the bug"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Detailed Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Steps to reproduce, expected vs actual behavior, etc."
              rows={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">System Log (.log or .json)</label>
            <input
              type="file"
              accept=".log,.json,.txt"
              onChange={handleFileChange}
              className={join(
                'block w-full text-sm text-foreground/70',
                'file:mr-4 file:py-2 file:px-4',
                'file:rounded file:border-0',
                'file:text-sm file:font-medium',
                'file:bg-primary file:text-primary-foreground',
                'file:cursor-pointer',
                'hover:file:bg-primary/90'
              )}
            />
            {logFile && (
              <p className="text-sm text-foreground/60 mt-2">
                Selected: {logFile.name}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Bug Report'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/testing')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

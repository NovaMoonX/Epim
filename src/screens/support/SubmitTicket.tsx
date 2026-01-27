import { useState, useEffect } from 'react';
import { Button, Input, Textarea, Select } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';
import { db, storage } from '@lib/firebase';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { App, TicketCategory, TicketPriority } from '@lib/types';
import { join } from '@moondreamsdev/dreamer-ui/utils';

export function SubmitTicket() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    appId: '',
    title: '',
    description: '',
    category: 'Help' as TicketCategory,
    priority: 'Medium' as TicketPriority,
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
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(newFiles);
    }
  };

  const uploadFiles = async (): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const storageRef = ref(storage, `tickets/${user!.id}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    });

    const urls = await Promise.all(uploadPromises);
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Upload files if any
      const mediaUrls = files.length > 0 ? await uploadFiles() : undefined;

      // Create ticket
      const ticketRef = await addDoc(collection(db, 'tickets'), {
        type: 'customer',
        appId: formData.appId,
        userId: user.id,
        userEmail: user.email,
        userName: user.displayName,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: 'Open',
        mediaUrls,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Create audit log
      await addDoc(collection(db, 'auditLogs'), {
        ticketId: ticketRef.id,
        userId: user.id,
        userEmail: user.email,
        action: 'Created ticket',
        timestamp: Timestamp.now(),
      });

      navigate('/support');
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to submit a ticket</h2>
        </div>
      </div>
    );
  }

  const appOptions = apps.map((app) => ({ value: app.id, label: app.name }));
  const categoryOptions = [
    { value: 'Billing', label: 'Billing' },
    { value: 'Bug', label: 'Bug' },
    { value: 'Help', label: 'Help' },
  ];
  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Blocker', label: 'Blocker' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Submit a Support Ticket</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select App *</label>
            <Select
              options={appOptions}
              value={formData.appId}
              onChange={(value) => setFormData({ ...formData, appId: value })}
              placeholder="Choose an app"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <Select
              options={categoryOptions}
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value as TicketCategory })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority *</label>
            <Select
              options={priorityOptions}
              value={formData.priority}
              onChange={(value) => setFormData({ ...formData, priority: value as TicketPriority })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief summary of your issue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of your issue"
              rows={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Attachments (Screenshots/Videos)</label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
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
            {files.length > 0 && (
              <p className="text-sm text-foreground/60 mt-2">
                {files.length} file(s) selected
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/support')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';
import { db } from '@lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { AuditLog } from '@lib/types';
import { useNavigate } from 'react-router-dom';

export function AuditLogViewer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxLogs, setMaxLogs] = useState(100);

  useEffect(() => {
    if (user?.email === 'nova@moondreams.dev') {
      loadLogs();
    }
  }, [user, maxLogs]);

  const loadLogs = async () => {
    try {
      const logsQuery = query(
        collection(db, 'auditLogs'),
        orderBy('timestamp', 'desc'),
        limit(maxLogs)
      );
      const logsSnapshot = await getDocs(logsQuery);
      const logsData: AuditLog[] = [];
      logsSnapshot.forEach((doc) => {
        logsData.push({ id: doc.id, ...doc.data() } as AuditLog);
      });
      setLogs(logsData);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.email !== 'nova@moondreams.dev') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-foreground/70">
            Audit Log is restricted to nova@moondreams.dev
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            ← Back to Admin Dashboard
          </Button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Audit Log</h1>
            <p className="text-foreground/70 mt-1">
              History of all ticket status changes and actions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMaxLogs(50)}
              disabled={maxLogs === 50}
            >
              50
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMaxLogs(100)}
              disabled={maxLogs === 100}
            >
              100
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMaxLogs(500)}
              disabled={maxLogs === 500}
            >
              500
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-foreground/60">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-foreground/60">No audit logs found.</p>
          </div>
        ) : (
          <div className="bg-muted/30 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-medium">Timestamp</th>
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Action</th>
                    <th className="text-left p-4 font-medium">Ticket ID</th>
                    <th className="text-left p-4 font-medium">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr
                      key={log.id}
                      className={index % 2 === 0 ? 'bg-background/30' : 'bg-background/10'}
                    >
                      <td className="p-4 text-sm">
                        {log.timestamp.toDate().toLocaleString()}
                      </td>
                      <td className="p-4 text-sm">
                        <div>{log.userEmail}</div>
                      </td>
                      <td className="p-4 text-sm font-medium">{log.action}</td>
                      <td className="p-4 text-sm">
                        <code className="bg-background/50 px-2 py-1 rounded text-xs">
                          {log.ticketId.substring(0, 8)}
                        </code>
                      </td>
                      <td className="p-4 text-sm">
                        {log.oldValue && log.newValue ? (
                          <span>
                            <span className="text-foreground/60">{log.oldValue}</span>
                            {' → '}
                            <span className="text-primary font-medium">{log.newValue}</span>
                          </span>
                        ) : (
                          <span className="text-foreground/40">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="text-center mt-4 text-sm text-foreground/60">
          Showing {logs.length} most recent log entries
        </div>
      </div>
    </div>
  );
}

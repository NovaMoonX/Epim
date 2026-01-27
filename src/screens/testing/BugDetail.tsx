import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, Textarea, Checkbox } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';
import { db } from '@lib/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { Ticket, Comment, App } from '@lib/types';

export function BugDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isTester } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [app, setApp] = useState<App | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id && user && isTester) {
      loadBugData();
    }
  }, [id, user, isTester]);

  const loadBugData = async () => {
    try {
      // Load bug report
      const ticketDoc = await getDoc(doc(db, 'tickets', id!));
      if (!ticketDoc.exists()) {
        navigate('/testing');
        return;
      }

      const ticketData = { id: ticketDoc.id, ...ticketDoc.data() } as Ticket;
      setTicket(ticketData);

      // Load app
      const appDoc = await getDoc(doc(db, 'apps', ticketData.appId));
      if (appDoc.exists()) {
        setApp({ id: appDoc.id, ...appDoc.data() } as App);
      }

      // Load all comments (testers can see internal comments)
      const commentsQuery = query(
        collection(db, 'comments'),
        where('ticketId', '==', id),
        orderBy('createdAt', 'asc')
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsData: Comment[] = [];
      commentsSnapshot.forEach((doc) => {
        commentsData.push({ id: doc.id, ...doc.data() } as Comment);
      });
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading bug:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        ticketId: id,
        userId: user.id,
        userEmail: user.email,
        userName: user.displayName,
        text: newComment,
        isInternal,
        createdAt: Timestamp.now(),
      });

      setNewComment('');
      setIsInternal(false);
      await loadBugData();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      Open: 'bg-blue-500',
      Pending: 'bg-amber-500',
      Resolved: 'bg-emerald-500',
    };

    return statusColors[status as keyof typeof statusColors] || statusColors.Open;
  };

  const getPriorityColor = (priority: string) => {
    const priorityColors = {
      Blocker: 'bg-rose-500',
      High: 'bg-orange-500',
      Medium: 'bg-yellow-500',
      Low: 'bg-slate-500',
    };

    return priorityColors[priority as keyof typeof priorityColors] || priorityColors.Medium;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-foreground/60">Loading bug report...</p>
        </div>
      </div>
    );
  }

  if (!ticket || !isTester) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-foreground/60">Bug report not found or access denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Button variant="outline" onClick={() => navigate('/testing')}>
            ← Back to Testing Dashboard
          </Button>
        </div>

        <div className="bg-muted/30 rounded-lg p-6 mb-6">
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold">{ticket.title}</h1>
              <span className="text-sm text-foreground/60">
                #{ticket.id.substring(0, 8)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
              <Badge className={getPriorityColor(ticket.priority)}>
                {ticket.priority}
              </Badge>
              <Badge>{ticket.environment}</Badge>
              {app && <Badge>{app.name}</Badge>}
              {ticket.fixedInBuild && (
                <Badge className="bg-teal-500">Fixed in {ticket.fixedInBuild}</Badge>
              )}
            </div>
          </div>

          <div className="space-y-4 mb-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-foreground/80 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {ticket.os && (
                <div>
                  <span className="font-medium">OS:</span> {ticket.os}
                </div>
              )}
              {ticket.browser && (
                <div>
                  <span className="font-medium">Browser:</span> {ticket.browser}
                </div>
              )}
              {ticket.appVersion && (
                <div>
                  <span className="font-medium">Version:</span> {ticket.appVersion}
                </div>
              )}
              {ticket.environment && (
                <div>
                  <span className="font-medium">Environment:</span> {ticket.environment}
                </div>
              )}
            </div>

            {ticket.logFileUrl && (
              <div>
                <h3 className="font-semibold mb-2">System Log</h3>
                <a
                  href={ticket.logFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Download Log File →
                </a>
              </div>
            )}
          </div>

          <div className="text-sm text-foreground/60 border-t border-border pt-4">
            <p>Created: {ticket.createdAt.toDate().toLocaleString()}</p>
            <p>Last Updated: {ticket.updatedAt.toDate().toLocaleString()}</p>
            {ticket.resolvedAt && (
              <p>Resolved: {ticket.resolvedAt.toDate().toLocaleString()}</p>
            )}
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Discussion</h2>

          <div className="space-y-4 mb-6">
            {comments.length === 0 ? (
              <p className="text-foreground/60 text-center py-4">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-background/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.userName}</span>
                      {comment.isInternal && (
                        <Badge className="text-xs bg-amber-500/20">
                          Internal Only
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-foreground/60">
                      {comment.createdAt.toDate().toLocaleString()}
                    </span>
                  </div>
                  <p className="text-foreground/80 whitespace-pre-wrap">{comment.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment}>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a technical comment..."
              rows={4}
              className="mb-3"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isInternal}
                  onCheckedChange={(checked) => setIsInternal(checked)}
                />
                <label onClick={() => setIsInternal(!isInternal)} className="cursor-pointer">
                  Internal comment (hidden from customers)
                </label>
              </div>
              <Button type="submit" disabled={submitting || !newComment.trim()}>
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

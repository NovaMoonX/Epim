import { useEffect, useState } from 'react';
import { Button, Badge, Select } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';
import { db } from '@lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { User, UserRole } from '@lib/types';
import { useNavigate } from 'react-router-dom';

export function UserManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email === 'nova@moondreams.dev') {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData: User[] = [];
      usersSnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(usersData.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
      });
      await loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role. Please try again.');
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    const roleColors = {
      admin: 'bg-rose-500',
      tester: 'bg-purple-500',
      customer: 'bg-blue-500',
    };

    return roleColors[role];
  };

  if (user?.email !== 'nova@moondreams.dev') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-foreground/70">
            User Management is restricted to nova@moondreams.dev
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

        <div className="mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-foreground/70 mt-1">
            Manage user roles and permissions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === 'admin').length}
            </div>
            <div className="text-sm text-foreground/60">Admins</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === 'tester').length}
            </div>
            <div className="text-sm text-foreground/60">Testers</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === 'customer').length}
            </div>
            <div className="text-sm text-foreground/60">Customers</div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-foreground/60">Loading users...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((userItem) => (
              <div
                key={userItem.id}
                className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {userItem.photoURL && (
                        <img
                          src={userItem.photoURL}
                          alt={userItem.displayName}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">{userItem.displayName}</h3>
                        <p className="text-sm text-foreground/60">{userItem.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge className={getRoleBadgeClass(userItem.role)}>
                        {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                      </Badge>
                      <span className="text-foreground/60">
                        Joined {userItem.createdAt.toDate().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      options={[
                        { value: 'customer', text: 'Customer' },
                        { value: 'tester', text: 'Tester' },
                        { value: 'admin', text: 'Admin' },
                      ]}
                      value={userItem.role}
                      onChange={(value) => handleRoleChange(userItem.id, value as UserRole)}
                      disabled={userItem.email === 'nova@moondreams.dev'}
                    />
                    {userItem.email === 'nova@moondreams.dev' && (
                      <span className="text-xs text-foreground/60">(Cannot change)</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

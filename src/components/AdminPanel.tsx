import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AdminPanelProps {
  currentUser: any;
  onClose: () => void;
}

const AdminPanel = ({ currentUser, onClose }: AdminPanelProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await api.getUsers(currentUser.id, search);
      if (result.users) {
        setUsers(result.users);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search]);

  const handleAction = async (action: string, userId: number) => {
    try {
      await api.adminAction(currentUser.id, action, userId);
      toast.success('Action completed');
      loadUsers();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <Icon name="X" size={20} />
          </button>
        </div>

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="bg-input"
        />

        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {users.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="User" size={20} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.username}</span>
                        {user.is_verified && (
                          <Icon name="CheckCircle" size={16} className="text-blue-500" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">ID: {user.id}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user.is_verified ? (
                      <Button size="sm" variant="outline" onClick={() => handleAction('unverify', user.id)}>
                        Remove Badge
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleAction('verify', user.id)}>
                        Add Badge
                      </Button>
                    )}
                    {user.is_banned ? (
                      <Button size="sm" variant="outline" onClick={() => handleAction('unban', user.id)}>
                        Unban
                      </Button>
                    ) : (
                      <Button size="sm" variant="destructive" onClick={() => handleAction('ban', user.id)}>
                        Ban
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default AdminPanel;

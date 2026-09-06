import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserStatus } from '@/services/userService';
import { AppUser } from '@/types';
import { Loader2, Search, Filter, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error("Error loading users", err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (user.email.toLowerCase()).includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleSuspend = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'suspended' ? 'suspend' : 'activate';
    
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await updateUserStatus(id, newStatus as any);
      setUsers(users.map(u => u.id === id ? { ...u, status: newStatus as any } : u));
    } catch (err) {
      console.error(`Failed to ${action} user`, err);
      alert(`Failed to ${action} user`);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 container-content py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-900">User Management</h1>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-neutral-400" />
          <select className="form-input w-40" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="buyer">Buyer</option>
            <option value="farmer">Farmer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="table-th">User</th>
              <th className="table-th">Role</th>
              <th className="table-th">Status</th>
              <th className="table-th">Joined</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-neutral-500">No users found.</td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="table-td">
                    <div>
                      <p className="font-medium text-neutral-900">{user.name || 'Unknown User'}</p>
                      <p className="text-xs text-neutral-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="table-td">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-neutral-100 text-neutral-700 capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="table-td">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${(user as any).status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {(user as any).status || 'active'}
                    </span>
                  </td>
                  <td className="table-td text-sm text-neutral-600">
                    {format((user.createdAt as any)?.toDate ? (user.createdAt as any).toDate() : new Date(user.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="table-td text-right space-x-2">
                    <button 
                      onClick={() => handleToggleSuspend(user.uid || user.id || '', (user as any).status || 'active')}
                      className={`btn-sm text-xs ${(user as any).status === 'active' ? 'btn-danger' : 'btn-primary'}`}
                      disabled={user.role === 'admin'}
                    >
                      {(user as any).status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

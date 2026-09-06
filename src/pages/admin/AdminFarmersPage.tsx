import React, { useEffect, useState } from 'react';
import { getAllFarmers, updateVerificationStatus } from '@/services/farmerService';
import { FarmerProfile } from '@/types';
import { Loader2, Search, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminFarmersPage() {
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadFarmers = async () => {
      try {
        setLoading(true);
        const data = await getAllFarmers();
        setFarmers(data);
      } catch (err) {
        console.error("Error loading farmers", err);
      } finally {
        setLoading(false);
      }
    };
    loadFarmers();
  }, []);

  const filteredFarmers = farmers.filter(f => filter === 'all' || f.verificationStatus === filter);

  const handleVerify = async (userId: string, status: 'verified' | 'rejected') => {
    if (!window.confirm(`Are you sure you want to mark this farmer as ${status}?`)) return;
    try {
      await updateVerificationStatus(userId, status);
      setFarmers(farmers.map(f => f.userId === userId ? { ...f, verificationStatus: status } : f));
    } catch (err) {
      console.error("Verification failed", err);
      alert("Failed to update verification status.");
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 container-content py-6">
      <h1 className="text-2xl font-bold text-neutral-900">Farmer Verification</h1>
      
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {['all', 'pending', 'verified', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${filter === status ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="table-th">Farm Details</th>
              <th className="table-th">Location</th>
              <th className="table-th">Status</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredFarmers.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-neutral-500">No farmers found for this filter.</td></tr>
            ) : (
              filteredFarmers.map(farmer => (
                <tr key={farmer.userId} className="hover:bg-neutral-50 transition-colors">
                  <td className="table-td">
                    <p className="font-medium text-neutral-900">{farmer.displayName}</p>
                    <p className="text-xs text-neutral-500">{farmer.bio}</p>
                  </td>
                  <td className="table-td text-sm text-neutral-700">
                    {farmer.district}, {farmer.state}
                  </td>
                  <td className="table-td">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize 
                      ${farmer.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' : 
                        farmer.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
                    >
                      {farmer.verificationStatus}
                    </span>
                  </td>
                  <td className="table-td text-right space-x-2">
                    {farmer.verificationStatus === 'pending' && (
                      <>
                        <button onClick={() => handleVerify(farmer.userId, 'verified')} className="btn-primary btn-sm bg-green-600 hover:bg-green-700 text-white">Approve</button>
                        <button onClick={() => handleVerify(farmer.userId, 'rejected')} className="btn-danger btn-sm">Reject</button>
                      </>
                    )}
                    {farmer.verificationStatus !== 'pending' && (
                       <span className="text-xs text-neutral-400">Action Taken</span>
                    )}
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

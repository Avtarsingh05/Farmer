import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks';
import { getFarmerProfile, updateFarmerProfile } from '@/services/farmerService';
import { FarmerProfile } from '@/types';
import { cn } from '@/utils/cn';

const profileSchema = z.object({
  displayName: z.string().min(3, 'Name is required'),
  bio: z.string().optional(),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  photoUrl: z.string().optional(),
  farmCount: z.number().min(0, 'Farm count cannot be negative').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function FarmerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const uid = user?.uid || user?.id;
        if (!uid) return;
        const data = await getFarmerProfile(uid);
        setProfile(data);
        if (data) {
          reset({
            displayName: data.displayName,
            bio: data.bio || '',
            district: data.district,
            state: data.state,
            photoUrl: data.photoURL || data.photoUrl || '',
            farmCount: data.farmCount || 0,
          });
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user, reset]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setSubmitting(true);
      const uid = user?.uid || user?.id;
      if (!uid) return;
      await updateFarmerProfile(uid, data as any);
      const updated = await getFarmerProfile(uid);
      setProfile(updated);
      setMsg({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    } catch (err: any) {
      setMsg({ text: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Account Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="flex border-b border-neutral-200 overflow-x-auto">
          {['profile', 'account'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-3 text-sm font-medium border-b-2 capitalize whitespace-nowrap",
                activeTab === tab 
                  ? "border-primary text-primary" 
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
              
              {msg.text && (
                <div className={cn("p-3 rounded text-sm", msg.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                  {msg.text}
                </div>
              )}

              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden border">
                  <img 
                    src={profile?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                <div>
                  <button type="button" className="btn-secondary btn-sm mb-1">Change Photo</button>
                  <p className="text-xs text-neutral-500">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Display Name</label>
                  <input {...register('displayName')} className="form-input" />
                  {errors.displayName && <p className="form-error">{errors.displayName.message}</p>}
                </div>
                <div>
                  <label className="form-label">Farm Count</label>
                  <input type="number" {...register('farmCount', { valueAsNumber: true })} className="form-input" />
                  {errors.farmCount && <p className="form-error">{errors.farmCount.message}</p>}
                </div>
              </div>

              <div>
                <label className="form-label">Bio / Description</label>
                <textarea {...register('bio')} rows={4} className="form-input" placeholder="Tell buyers about your farming practices..."></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">District</label>
                  <input {...register('district')} className="form-input" />
                  {errors.district && <p className="form-error">{errors.district.message}</p>}
                </div>
                <div>
                  <label className="form-label">State</label>
                  <input {...register('state')} className="form-input" />
                  {errors.state && <p className="form-error">{errors.state.message}</p>}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="border border-neutral-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Account Status</h3>
                {profile?.verificationStatus === 'verified' ? (
                  <div className="flex items-start gap-3 bg-green-50 p-4 rounded text-green-800">
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Verified Farmer Account</p>
                      <p className="text-sm mt-1">Your account has been verified. You have full access to the marketplace.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 bg-amber-50 p-4 rounded text-amber-800">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">
                        {profile?.verificationStatus === 'rejected' ? 'Verification Rejected' : 'Pending Verification'}
                      </p>
                      <p className="text-sm mt-1">
                        {profile?.verificationStatus === 'rejected' 
                          ? 'Your verification was rejected. Please update your profile.' 
                          : 'Your account is under review. Please ensure your profile is complete.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border border-neutral-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Security</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Email Address</p>
                    <p className="text-neutral-900">{user?.email}</p>
                  </div>
                  <div>
                    <button className="btn-secondary btn-sm">Change Password</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

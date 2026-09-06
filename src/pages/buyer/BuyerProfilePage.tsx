import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks';
import { updateProfile } from '@/services/userService'; // mocked
import { User, MapPin, UserCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone required").optional(),
});

export default function BuyerProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: '' 
    }
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name || '', phone: '' });
    }
  }, [user, reset]);

  const onSaveProfile = async (data: any) => {
    if (!user) return;
    try {
      setSaving(true);
      console.log("Saving profile", data);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-content py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">My Profile</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-primary/10 text-primary' : 'text-neutral-600 hover:bg-neutral-100'}`}
          >
            <UserCircle className="w-5 h-5" />
            Personal Info
          </button>
          <button 
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${activeTab === 'addresses' ? 'bg-primary/10 text-primary' : 'text-neutral-600 hover:bg-neutral-100'}`}
          >
            <MapPin className="w-5 h-5" />
            Saved Addresses
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 card p-6">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Personal Information</h2>
              
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-neutral-100">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center text-primary overflow-hidden">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900">{user?.name || 'User'}</h3>
                  <p className="text-sm text-neutral-500">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4 max-w-md">
                <div>
                  <label className="form-label">Full Name</label>
                  <input {...register('name')} className="form-input" />
                  {errors.name && <p className="form-error">{errors.name.message?.toString()}</p>}
                </div>
                <div>
                  <label className="form-label">Phone Number</label>
                  <input {...register('phone')} className="form-input" />
                  {errors.phone && <p className="form-error">{errors.phone.message?.toString()}</p>}
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Saved Addresses</h2>
              <div className="text-center py-12 text-neutral-500">
                <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p>You haven't saved any addresses yet.</p>
                <p className="text-sm mt-2">Addresses used during checkout will be saved here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

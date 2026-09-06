import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BadgeCheck, Tractor } from 'lucide-react';
import { FarmerProfile } from '@/types';
import { cn } from '@/utils/cn';

interface FarmerCardProps {
  farmer: FarmerProfile;
  className?: string;
}

export function FarmerCard({ farmer, className }: FarmerCardProps) {
  const DEFAULT_FARMER_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';
  const photo = farmer.photoURL || farmer.photoUrl || DEFAULT_FARMER_AVATAR;
  return (
    <Link 
      to={`/farmers/${farmer.userId}`}
      className={cn("card p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group", className)}
    >
      <div className="relative shrink-0">
        <div className="w-16 h-16 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200">
          <img 
            src={photo} 
            alt={farmer.displayName} 
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_FARMER_AVATAR;
            }}
          />
        </div>
        {farmer.verificationStatus === 'verified' && (
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm" title="Verified Farmer">
            <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500/10" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-neutral-900 truncate group-hover:text-primary transition-colors">
          {farmer.displayName}
        </h3>
        
        <div className="flex items-center text-sm text-neutral-600 mt-1 gap-1">
          <MapPin className="w-4 h-4 shrink-0 text-neutral-400" />
          <span className="truncate">
            {farmer.district ? `${farmer.district}, ${farmer.state}` : farmer.state || farmer.primaryLocation || 'Location unavailable'}
          </span>
        </div>

        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Tractor className="w-3.5 h-3.5" />
            {farmer.farmCount || 1} {farmer.farmCount === 1 ? 'Farm' : 'Farms'}
          </span>
        </div>
      </div>
    </Link>
  );
}

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tractor, Sprout, MapPin, Home, ArrowLeft, Wind, Sun, CloudRain } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 md:top-20 md:left-20 text-primary/10 animate-bounce" style={{ animationDuration: '4s' }}>
        <Sprout size={80} className="md:w-[120px] md:h-[120px]" />
      </div>
      <div className="absolute top-20 right-10 md:right-32 text-accent/10 animate-pulse" style={{ animationDuration: '3s' }}>
        <Sun size={100} className="md:w-[150px] md:h-[150px]" />
      </div>
      <div className="absolute bottom-10 left-20 md:bottom-32 md:left-40 text-info/10 animate-pulse" style={{ animationDuration: '5s' }}>
        <CloudRain size={90} className="md:w-[130px] md:h-[130px]" />
      </div>
      <div className="absolute bottom-20 right-10 md:bottom-20 md:right-20 text-neutral-300/40 animate-bounce" style={{ animationDuration: '6s' }}>
        <Wind size={100} className="md:w-[150px] md:h-[150px]" />
      </div>

      <div className="max-w-2xl w-full text-center z-10 space-y-8 animate-fade-up">
        {/* 404 Graphic */}
        <div className="relative inline-block mt-8">
          <h1 className="text-8xl md:text-[12rem] font-black text-neutral-200 tracking-tighter select-none">
            404
          </h1>
          {/* Tractor driving across the 404 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group">
            <div className="animate-[spin_10s_linear_infinite] relative">
              <Tractor size={80} className="text-primary drop-shadow-xl md:w-[120px] md:h-[120px] -ml-6 md:-ml-10" />
            </div>
          </div>
        </div>

        {/* Funny Text */}
        <div className="space-y-4 px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-neutral-900 tracking-tight">
            Aiyo! Crop Not Found.
          </h2>
          <p className="text-lg text-neutral-600 max-w-lg mx-auto font-medium">
            Looks like our tractor took a wrong turn deep into the sugarcane fields, or the neighbor's goat chewed up the link you were looking for.
          </p>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto">
            Either way, this patch of digital land is completely barren. Let's get you back to greener pastures!
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 sm:flex-none border-2 border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100 px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" /> Reverse Tractor
          </button>
          <Link
            to="/market"
            className="flex-1 sm:flex-none bg-primary text-white hover:bg-primary-600 px-6 py-3 rounded-full font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-1 active:scale-95"
          >
            <MapPin className="w-5 h-5" /> Go to Local Mandi
          </Link>
          <Link
            to="/"
            className="flex-1 sm:flex-none bg-accent text-white hover:bg-accent-600 px-6 py-3 rounded-full font-bold shadow-lg shadow-accent/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-1 active:scale-95"
          >
            <Home className="w-5 h-5" /> Back to Base Farm
          </Link>
        </div>
      </div>
    </div>
  );
}

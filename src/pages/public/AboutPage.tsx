import React from 'react';
import { Target, Heart, Sprout } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Hero Section */}
      <section className="bg-primary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">Empowering Farmers. Fresh for Buyers.</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            We are building a transparent agricultural marketplace to eliminate unnecessary intermediaries and ensure fair value for both producers and consumers.
          </p>
        </div>
      </section>

      {/* The Problem & Solution */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-neutral-900 border-b-4 border-red-500 inline-block pb-2">The Problem</h2>
              <p className="text-lg text-neutral-700 leading-relaxed">
                For decades, the agricultural supply chain has been dominated by a long line of intermediaries. By the time produce reaches the end buyer, the price has inflated significantly, yet the farmer who grew it receives only a fraction of that final price. This systemic inefficiency hurts both sides of the market.
              </p>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-neutral-900 border-b-4 border-green-500 inline-block pb-2">Our Solution</h2>
              <p className="text-lg text-neutral-700 leading-relaxed">
                KisanMitra is a digital marketplace that connects verified farmers directly with buyers—be it bulk purchasers, restaurants, or households. By facilitating direct trade, we enable price transparency, better margins for farmers, and fresher produce for buyers at fair market rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-neutral-900">Our Core Values</h2>
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900">Transparency First</h3>
            <p className="text-neutral-600">Open pricing and clear provenance. Everyone deserves to know what they are paying for and who grew it.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Sprout className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900">Farmer Prosperity</h3>
            <p className="text-neutral-600">Our platform is designed to put the pricing power back into the hands of the producers.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900">Quality Assured</h3>
            <p className="text-neutral-600">By shortening the supply chain, food spends less time in transit, ensuring maximum freshness.</p>
          </div>
        </div>
      </section>

      {/* Team Placeholder */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold text-neutral-900">Our Team</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            We are a dedicated team of agritech enthusiasts, engineers, and agricultural experts committed to transforming the farming ecosystem in India.
          </p>
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-neutral-200 aspect-[16/9] max-h-96">
            <img 
              src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1200&auto=format&fit=crop&q=80" 
              alt="KisanMitra agricultural team working with Indian farmers" 
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=1200&auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
              <p className="text-white font-medium text-sm sm:text-base">
                Collaborating directly with regional farming communities across Maharashtra, Punjab, Haryana, and Uttar Pradesh.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

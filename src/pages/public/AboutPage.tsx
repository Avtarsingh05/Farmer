import React from 'react';
import { Target, Heart, Sprout, Globe2, ShieldCheck } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=2000&auto=format&fit=crop&q=80" 
            alt="Farm landscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-neutral-900/70" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-sm text-sm font-medium mb-6">
             Our Mission
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Empowering Farmers.<br className="hidden md:block" /> Fresh for Buyers.
          </h1>
          <p className="text-xl text-neutral-200 max-w-3xl mx-auto leading-relaxed">
            We are building a transparent agricultural marketplace to eliminate unnecessary intermediaries and ensure fair value for both producers and consumers.
          </p>
        </div>
      </section>

      {/* The Problem & Solution */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50 relative -mt-8 rounded-t-3xl z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="space-y-8 animate-fade-up">
              <div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-1 bg-red-500 rounded-full" />
                  The Problem
                </h2>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  For decades, the agricultural supply chain has been dominated by a long line of intermediaries. By the time produce reaches the end buyer, the price has inflated significantly, yet the farmer who grew it receives only a fraction of that final price. This systemic inefficiency hurts both sides of the market.
                </p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-100">
                <h2 className="text-3xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-1 bg-green-500 rounded-full" />
                  Our Solution
                </h2>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  KisanMitra is a digital marketplace that connects verified farmers directly with buyers—be it bulk purchasers, restaurants, or households. By facilitating direct trade, we enable price transparency, better margins for farmers, and fresher produce for buyers at fair market rates.
                </p>
              </div>
            </div>
            <div className="relative animate-fade-up animate-delay-200 hidden md:block">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative">
                <img 
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop&q=80" 
                  alt="Farmer showing produce" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-neutral-100 max-w-xs">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">100% Verified</p>
                    <p className="text-sm text-neutral-500">Farmers & Produce</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              The principles that guide our platform and every transaction that happens on it.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Globe2, title: "Transparency First", desc: "Open pricing and clear provenance. Everyone deserves to know what they are paying for and who grew it.", delay: 100 },
              { icon: Sprout, title: "Farmer Prosperity", desc: "Our platform is designed to put the pricing power back into the hands of the producers, ensuring they earn a fair wage.", delay: 200 },
              { icon: Heart, title: "Quality Assured", desc: "By shortening the supply chain, food spends less time in transit, ensuring maximum freshness when it reaches your table.", delay: 300 }
            ].map((val, i) => (
              <div key={i} className={`bg-neutral-50 p-8 rounded-3xl border border-neutral-100 text-center hover:-translate-y-2 transition-transform duration-300 animate-fade-up animate-delay-${val.delay}`}>
                <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary mx-auto mb-6 rotate-3">
                  <val.icon className="w-10 h-10 -rotate-3" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">{val.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Image Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-900 text-white rounded-t-[3rem] mt-8">
        <div className="max-w-7xl mx-auto text-center space-y-12 animate-fade-up">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Our Community</h2>
            <p className="text-xl text-neutral-400 leading-relaxed">
              We are a dedicated team of agritech enthusiasts, engineers, and agricultural experts committed to transforming the farming ecosystem in India, working hand-in-hand with regional farming communities across Maharashtra, Punjab, Haryana, and Uttar Pradesh.
            </p>
          </div>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[21/9] max-h-[600px] border border-white/10 group">
            <img 
              src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=2000&auto=format&fit=crop&q=80" 
              alt="KisanMitra agricultural team working with Indian farmers" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent flex flex-col justify-end p-8 md:p-12">
              <p className="text-white font-medium text-lg md:text-xl max-w-2xl">
                "Direct trade is not just about better prices; it's about building lasting relationships between those who grow our food and those who consume it."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

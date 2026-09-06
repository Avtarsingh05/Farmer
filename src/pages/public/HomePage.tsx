import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Leaf, Shield, TrendingUp, Users } from 'lucide-react';
import { ScrollExpand } from '@/components/ui';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      {/* SECTION 1 - Hero */}
      <section className="bg-[#F9F7F2] pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 tracking-tight mb-6 leading-tight">
            Buy closer to the source. <br className="hidden sm:block" />
            <span className="text-primary">Sell directly to the market.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-600 mb-10">
            KisanMitra connects farmers directly with buyers. Transparent pricing. No unnecessary middlemen. Fresh produce from verified farms.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-14">
            <Link to="/market" className="btn-primary btn-lg inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
              Explore Produce <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/register" className="btn-secondary btn-lg inline-flex items-center justify-center gap-2 bg-white">
              Sell Your Produce
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-neutral-600 font-medium pb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span>500+ Active Farmers</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Direct farm-to-buyer ordering</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>Transparent price information</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1.5 - React Bits <ScrollExpand /> Interactive Story Showcase */}
      <section className="relative w-full bg-neutral-900">
        <ScrollExpand
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1800&auto=format&fit=crop&q=80"
          alt="Lush agricultural farmlands in Bharat at golden hour"
          title="Direct From Soil to Society"
          scrollHint="Scroll to expand our journey"
          useWindowScroll
          topOffset={64}
          startWidth={52}
          startHeight={64}
          startRadius={28}
          endRadius={0}
          mediaZoom={1.35}
          scrollDistance={1.1}
          holdDistance={0.4}
          smoothing={0.12}
          overlayScrim={0.65}
        >
          <div className="max-w-3xl text-center px-4 space-y-6">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg leading-tight">
              Transparent Pricing.<br />
              <span className="text-emerald-400">Zero Middlemen.</span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-neutral-100 max-w-2xl mx-auto leading-relaxed drop-shadow">
              By removing layered intermediaries, KisanMitra returns maximum earnings directly to farmer families while delivering fresh, traceable produce to buyers at true market rates.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/market"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base shadow-xl hover:shadow-2xl transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                Explore Market <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register?role=farmer"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-base border border-white/30 backdrop-blur-md transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                Sell Your Harvest
              </Link>
            </div>

            <div className="pt-4 grid grid-cols-3 gap-6 max-w-xl mx-auto border-t border-white/20 text-white">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
                <div className="text-xs sm:text-sm text-neutral-300">Direct Farm Gate</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400">₹0</div>
                <div className="text-xs sm:text-sm text-neutral-300">Broker Commissions</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">Verified</div>
                <div className="text-xs sm:text-sm text-neutral-300">Farms & Quality</div>
              </div>
            </div>
          </div>
        </ScrollExpand>
      </section>

      {/* SECTION 2 - How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900">How KisanMitra Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold text-neutral-900">Farmers List Produce</h3>
              <p className="text-neutral-600">Verified farmers list their fresh harvest with accurate, transparent pricing directly on the platform.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold text-neutral-900">Buyers Place Orders</h3>
              <p className="text-neutral-600">Buyers browse products, compare prices, and order exactly what they need directly from the source.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold text-neutral-900">Produce Delivered</h3>
              <p className="text-neutral-600">Quality produce moves from the farm straight to the buyer with full visibility every step of the way.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 - For Farmers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 rounded-2xl aspect-square md:aspect-[4/3] flex items-center justify-center overflow-hidden relative shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=900&auto=format&fit=crop&q=80"
              alt="Indian farmer inspecting fresh crops in farm"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wider uppercase">
              <Leaf className="w-4 h-4 text-primary" />
              <span>For Farmers</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">Sell directly to buyers.</h2>
            <ul className="space-y-4 text-neutral-600">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary shrink-0" />
                <span><strong>Set your own price:</strong> No arbitrary market rates, price your produce fairly.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary shrink-0" />
                <span><strong>Reach more buyers:</strong> Access a network of buyers beyond your local mandis.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary shrink-0" />
                <span><strong>Track orders:</strong> Manage incoming requests effortlessly from your dashboard.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary shrink-0" />
                <span><strong>Manage inventory:</strong> Keep your stock updated in real-time as you harvest.</span>
              </li>
            </ul>
            <div className="pt-4">
              <Link to="/register" className="btn-primary inline-flex items-center justify-center">
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 - For Buyers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wider uppercase">
              <Users className="w-4 h-4 text-primary" />
              <span>For Buyers</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">Find produce from nearby farmers.</h2>
            <ul className="space-y-4 text-neutral-600">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary shrink-0" />
                <span><strong>Browse verified farmers:</strong> Know exactly where your food is coming from.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary shrink-0" />
                <span><strong>Compare prices:</strong> Make informed decisions with transparent market pricing.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary shrink-0" />
                <span><strong>Track orders:</strong> Monitor your delivery status from farm to door.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary shrink-0" />
                <span><strong>Favorites:</strong> Save your trusted farmers for quick repeat ordering.</span>
              </li>
            </ul>
            <div className="pt-4">
              <Link to="/market" className="btn-primary inline-flex items-center justify-center">
                Find Produce
              </Link>
            </div>
          </div>
          <div className="rounded-2xl aspect-square md:aspect-[4/3] flex items-center justify-center overflow-hidden relative shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=900&auto=format&fit=crop&q=80"
              alt="Fresh farm produce sorted in crates"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* SECTION 5 - Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">Ready to get started?</h2>
          <p className="text-xl text-neutral-600">Join the growing community of farmers and buyers transforming agricultural trade.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register?role=farmer" className="btn-primary btn-lg inline-flex items-center justify-center">
              I'm a Farmer
            </Link>
            <Link to="/register?role=buyer" className="btn-secondary btn-lg inline-flex items-center justify-center bg-white">
              I'm a Buyer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;


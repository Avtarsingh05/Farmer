import React, { useEffect, useRef, useState } from 'react';
import { getTestimonials } from '@/services/landingService';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Shield, TrendingUp, Users,
  Star, Package, MapPin, ChevronDown, ShoppingBag, Sprout,
  BarChart3, Truck, BadgeCheck, IndianRupee, TrendingDown,
} from 'lucide-react';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const MARKET_PULSE = [
  { name: 'Tomato',    district: 'Nashik, MH',    farmerPrice: 26,  mandiPrice: 32,  unit: 'kg', grade: 'A' },
  { name: 'Onion',     district: 'Lasalgaon, MH', farmerPrice: 32,  mandiPrice: 38,  unit: 'kg', grade: 'A' },
  { name: 'Wheat',     district: 'Sehore, MP',    farmerPrice: 34,  mandiPrice: 40,  unit: 'kg', grade: 'A' },
  { name: 'Potato',    district: 'Agra, UP',      farmerPrice: 22,  mandiPrice: 26,  unit: 'kg', grade: 'B' },
  { name: 'Turmeric',  district: 'Salem, TN',     farmerPrice: 140, mandiPrice: 165, unit: 'kg', grade: 'A' },
  { name: 'Chana Dal', district: 'Gulbarga, KA',  farmerPrice: 76,  mandiPrice: 88,  unit: 'kg', grade: 'A' },
];

const DEFAULT_TESTIMONIALS = [
  {
    name: 'Ramesh Patil', role: 'Onion Farmer', district: 'Nashik, Maharashtra',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    quote: 'Middlemen used to take 40%. Now I sell directly through KisanMitra. Last month I earned ₹12,000 more.',
    rating: 5, stat: '+₹12,000 / month',
  },
  {
    name: 'Anita Mehta', role: 'Restaurant Buyer', district: 'Bandra, Mumbai',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b18c?w=120&auto=format&fit=crop&q=80',
    quote: 'I source all vegetables for my 3 restaurants through KisanMitra. Quality is consistent and prices are fair.',
    rating: 5, stat: 'Saves ₹8,000/month',
  },
  {
    name: 'Sukhwinder Singh', role: 'Wheat & Rice Farmer', district: 'Amritsar, Punjab',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    quote: 'Used to struggle getting fair rates at the mandi. KisanMitra gave me access to buyers in Delhi and Mumbai.',
    rating: 5, stat: '+₹18,000 / month',
  },
];

const HomePage = () => {
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  useEffect(() => {
    getTestimonials().then(data => {
      if (data && data.length > 0) setTestimonials(data);
    }).catch(console.error);
  }, []);
  const howSection          = useInView(0.12);
  const pulseSection        = useInView(0.08);
  const farmerSection       = useInView(0.08);
  const buyerSection        = useInView(0.08);
  const testimonialsSection = useInView(0.08);
  const ctaSection          = useInView(0.08);


  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 overflow-x-hidden">

      {/* HERO */}
      <section
        className="relative min-h-screen flex flex-col justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #F9F7F2 0%, #F0EDE6 35%, #E8F5E9 70%, #F9F7F2 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/2 -left-48 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(193,127,36,0.04)' }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-2xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-primary text-sm font-semibold animate-fade-up">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
                India's Direct Farm-to-Market Platform
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-neutral-900 tracking-tight leading-none animate-fade-up delay-100">
                Farmers earn{' '}
                <span className="relative inline-block text-primary">
                  more.
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                    <path d="M2 6 Q100 2 198 6" stroke="#2D5016" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4"/>
                  </svg>
                </span>
                <br />Buyers pay{' '}
                <span style={{ color: 'var(--color-accent)' }}>less.</span>
              </h1>
              <p className="text-xl text-neutral-600 max-w-lg leading-relaxed animate-fade-up delay-200">
                KisanMitra removes brokers from India's agricultural supply chain. Verified farmers sell directly to buyers — transparent APMC pricing, zero hidden commissions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-300">
                <Link to="/market" className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all duration-200">
                  Browse Produce <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/register?role=farmer" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-neutral-800 font-semibold text-base rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
                  <Sprout className="w-5 h-5 text-primary" /> Join as Farmer
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-neutral-500 animate-fade-up delay-400">
                {[
                  { icon: BadgeCheck, label: '500+ Verified Farmers' },
                  { icon: Shield,     label: 'APMC Price Transparency' },
                  { icon: Truck,      label: 'Direct Farm Dispatch' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-primary" /><span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Hero visual */}
            <div className="relative hidden lg:flex items-center justify-center h-[520px] animate-fade-in delay-300">
              <div className="relative w-72 h-72 rounded-3xl overflow-hidden shadow-2xl border-4 border-white animate-float-slow">
                <img src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600&auto=format&fit=crop&q=80" alt="Farmer" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-8 right-4 bg-white rounded-2xl shadow-xl px-4 py-3 border border-neutral-100 animate-float" style={{ animationDelay: '0s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-green-600" /></div>
                  <div><div className="text-xs text-neutral-500">Onion · Lasalgaon</div><div className="text-sm font-bold text-neutral-900">&#8377;32/kg</div></div>
                </div>
              </div>
              <div className="absolute bottom-16 left-2 bg-white rounded-2xl shadow-xl px-4 py-3 border border-neutral-100 animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center"><IndianRupee className="w-4 h-4 text-amber-600" /></div>
                  <div><div className="text-xs text-neutral-500">Farmer earns more</div><div className="text-sm font-bold text-green-700">+&#8377;8/kg avg</div></div>
                </div>
              </div>
              <div className="absolute bottom-8 right-0 bg-primary text-white rounded-2xl shadow-xl px-4 py-3 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-white/80" />
                  <div><div className="text-xs text-white/70">Order placed</div><div className="text-sm font-bold">Just now ✓</div></div>
                </div>
              </div>
              <div className="absolute top-1/2 -left-4 -translate-y-1/2 bg-white rounded-2xl shadow-xl px-3 py-2 border border-neutral-100 animate-float" style={{ animationDelay: '3s' }}>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /><span className="text-xs font-semibold text-neutral-700">Nashik, MH</span></div>
              </div>
              <div className="absolute bottom-0 right-16 w-40 h-40 rounded-2xl overflow-hidden shadow-lg border-2 border-white animate-float" style={{ animationDelay: '1.5s' }}>
                <img src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=300&auto=format&fit=crop&q=80" alt="Produce" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-400">
          <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-5 h-5 animate-scroll-bounce" />
        </div>
      </section>

      {/* SCROLL EXPAND */}
      <section className="relative w-full bg-neutral-950 py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1800&auto=format&fit=crop&q=80" alt="Farmlands at golden hour" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/90" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-semibold tracking-wide">
            <Shield className="w-4 h-4" /> Direct Farm Network
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Transparent Pricing.<br />
            <span className="text-emerald-400">Zero Middlemen.</span>
          </h2>
          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            By removing layered intermediaries, KisanMitra returns maximum earnings to farmer families while delivering fresh, traceable produce at true market rates.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/market"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-900/30 transition-all inline-flex items-center justify-center gap-2 active:scale-95"
            >
              Explore Market <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/register?role=farmer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 backdrop-blur-md transition-all inline-flex items-center justify-center gap-2 active:scale-95"
            >
              Sell Your Harvest
            </Link>
          </div>
          <div className="pt-12 mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto border-t border-white/10 text-white">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold">100%</div>
              <div className="text-xs sm:text-sm text-neutral-400 mt-1 font-medium">Direct Farm Gate</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">₹0</div>
              <div className="text-xs sm:text-sm text-neutral-400 mt-1 font-medium">Broker Commissions</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold">Verified</div>
              <div className="text-xs sm:text-sm text-neutral-400 mt-1 font-medium">Farms & Quality</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section ref={howSection.ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 ${howSection.inView ? 'animate-fade-up' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-4"><BarChart3 className="w-4 h-4" /> The Process</div>
            <h2 className="text-4xl font-extrabold text-neutral-900">How KisanMitra Works</h2>
            <p className="mt-4 text-lg text-neutral-500 max-w-xl mx-auto">Three simple steps that change everything for Indian farmers and buyers.</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-14 left-[16.67%] right-[16.67%] h-0.5 bg-neutral-100">
              <div className="h-full bg-primary/40 transition-all duration-1000 ease-out" style={{ width: howSection.inView ? '100%' : '0%' }} />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: 1, icon: Sprout,     title: 'Farmers List Produce',  desc: 'Verified farmers upload harvest with real APMC benchmark pricing.',  detail: 'Photo upload · APMC-anchored price · Quality grade', delay: 'delay-100' },
                { step: 2, icon: ShoppingBag,title: 'Buyers Place Orders',   desc: 'Browse, compare prices, and order directly without any agents.',       detail: 'Browse by district · Filter by quality · Instant checkout', delay: 'delay-300' },
                { step: 3, icon: Truck,      title: 'Produce Delivered',     desc: 'Farm-to-door with full order tracking and transparent delivery status.',detail: 'Live tracking · COD + UPI · Direct dispatch', delay: 'delay-500' },
              ].map(({ step, icon: Icon, title, desc, detail, delay }) => (
                <div key={step} className={`relative ${howSection.inView ? `animate-fade-up ${delay}` : 'opacity-0'}`}>
                  <div className="group bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center" style={{ boxShadow: '0 8px 25px rgba(45,80,22,0.3)' }}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">{step}</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">{title}</h3>
                    <p className="text-neutral-500 leading-relaxed mb-4">{desc}</p>
                    <div className="text-xs text-primary font-semibold bg-primary/5 rounded-xl px-3 py-2">{detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARKET PULSE */}
      <section ref={pulseSection.ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 ${pulseSection.inView ? 'animate-fade-up' : 'opacity-0'}`}>
            <div>
              <div className="inline-flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-3">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />Today's Market Prices
              </div>
              <h2 className="text-3xl font-extrabold text-neutral-900">Live APMC Mandi Pulse</h2>
              <p className="text-neutral-500 mt-2">Farm-gate prices vs. official APMC mandi benchmark rates.</p>
            </div>
            <Link to="/market" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all text-sm">View all produce <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MARKET_PULSE.map((item, i) => {
              const saving = item.mandiPrice - item.farmerPrice;
              const savingPct = Math.round((saving / item.mandiPrice) * 100);
              const delays = ['delay-100','delay-200','delay-300','delay-400','delay-500','delay-600'];
              return (
                <div key={item.name} className={`bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${pulseSection.inView ? `animate-scale-in ${delays[i] || ''}` : 'opacity-0'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-neutral-900 text-lg">{item.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5"><MapPin className="w-3 h-3" />{item.district}</div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.grade === 'A' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>Grade {item.grade}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-500">Farm Gate Price</span>
                      <span className="text-xl font-extrabold text-primary">&#8377;{item.farmerPrice}/{item.unit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-500">Mandi Benchmark</span>
                      <span className="text-sm font-semibold text-neutral-400 line-through">&#8377;{item.mandiPrice}/{item.unit}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      <TrendingDown className="w-3 h-3" /> Save &#8377;{saving}/{item.unit} ({savingPct}% less)
                    </div>
                    <Link to="/market" className="text-xs text-primary font-semibold hover:underline">Buy now</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOR FARMERS */}
      <section ref={farmerSection.ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className={`relative ${farmerSection.inView ? 'animate-scale-in' : 'opacity-0'}`}>
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
              <img src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=900&auto=format&fit=crop&q=80" alt="Farmer" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[{ val: '&#8377;8+', label: 'more per kg avg.' }, { val: '&#8377;0', label: 'commission fee' }, { val: '24h', label: 'order dispatch' }].map(({ val, label }) => (
                    <div key={label}><div className="text-xl font-extrabold text-primary" dangerouslySetInnerHTML={{__html: val}} /><div className="text-[11px] text-neutral-500 leading-tight">{label}</div></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={`space-y-6 ${farmerSection.inView ? 'animate-fade-up delay-200' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase"><Sprout className="w-4 h-4" /> For Farmers</div>
            <h2 className="text-4xl font-extrabold text-neutral-900 leading-tight">Set your own price.<br /><span className="text-primary">Keep what you earn.</span></h2>
            <p className="text-neutral-600 text-lg">Stop losing 30–40% of your income to commission agents. Sell directly at a fair price you control.</p>
            <ul className="space-y-4">
              {[
                { title: 'Own your pricing',          desc: 'Set farm-gate prices anchored to real APMC mandi benchmarks.' },
                { title: 'Reach beyond local mandis', desc: 'Access buyers in Delhi, Mumbai, Pune, and Bangalore from your village.' },
                { title: 'Smart inventory dashboard', desc: 'Update stock in real-time, manage orders, and track earnings from your phone.' },
                { title: 'Free to join forever',      desc: 'No listing fees. No subscription. 0% commission currently.' },
              ].map(({ title, desc }) => (
                <li key={title} className="flex items-start gap-3 group">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <div><span className="font-semibold text-neutral-900">{title}: </span><span className="text-neutral-600">{desc}</span></div>
                </li>
              ))}
            </ul>
            <div className="pt-4 flex gap-4">
              <Link to="/register?role=farmer" className="group inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:bg-primary/90 transition-all">
                Start Selling Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/how-it-works" className="inline-flex items-center gap-2 px-6 py-3 text-primary font-semibold hover:underline">How it works</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOR BUYERS */}
      <section ref={buyerSection.ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className={`space-y-6 ${buyerSection.inView ? 'animate-fade-up' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 text-emerald-400 font-bold text-sm tracking-widest uppercase"><Users className="w-4 h-4" /> For Buyers</div>
            <h2 className="text-4xl font-extrabold text-white leading-tight">Know your farmer.<br /><span className="text-emerald-400">Trust your food.</span></h2>
            <p className="text-neutral-400 text-lg">Every product shows the exact farm, district, quality grade, and APMC reference price. No mystery supply chains.</p>
            <ul className="space-y-4">
              {[
                { title: 'Verified farm origins',   desc: 'Full traceability — farmer, district, harvest date and quality grade.' },
                { title: 'Save 15–25% vs. retail', desc: 'Skip the middlemen markup. Direct farm prices are consistently lower.' },
                { title: 'Flexible delivery',       desc: 'Choose farm pickup or home delivery with real order tracking.' },
                { title: 'COD + UPI',               desc: 'Pay on delivery or scan-and-pay. Zero payment friction.' },
              ].map(({ title, desc }) => (
                <li key={title} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div><span className="font-semibold text-white">{title}: </span><span className="text-neutral-400">{desc}</span></div>
                </li>
              ))}
            </ul>
            <Link to="/market" className="group inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg transition-all">
              Browse Produce <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className={`relative ${buyerSection.inView ? 'animate-scale-in delay-200' : 'opacity-0'}`}>
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
              <img src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=900&auto=format&fit=crop&q=80" alt="Produce" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/50 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 bg-neutral-900/90 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div><div className="text-white font-semibold">Alphonso Mangoes</div><div className="text-neutral-400 text-sm">Devgad, Ratnagiri · Grade A</div></div>
                  <div className="text-right"><div className="text-emerald-400 font-extrabold text-lg">&#8377;680<span className="text-sm font-normal">/dz</span></div><div className="text-neutral-500 text-xs line-through">&#8377;820 APMC rate</div></div>
                </div>
                <div className="mt-3 flex gap-2">
                  <div className="flex-1 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg text-center">Add to Cart</div>
                  <div className="bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-lg text-center">View Farm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section ref={testimonialsSection.ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 ${testimonialsSection.inView ? 'animate-fade-up' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-4"><Star className="w-4 h-4" /> Real Stories</div>
            <h2 className="text-4xl font-extrabold text-neutral-900">Farmers and buyers love KisanMitra</h2>
            <p className="mt-4 text-lg text-neutral-500 max-w-xl mx-auto">Real results from real people across India.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => {
              const delays = ['delay-200', 'delay-400', 'delay-600'];
              return (
                <div key={t.name} className={`bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col ${testimonialsSection.inView ? `animate-fade-up ${delays[i] || ''}` : 'opacity-0'}`}>
                  <div className="flex gap-0.5 mb-4">{[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}</div>
                  <blockquote className="text-neutral-700 leading-relaxed flex-1 mb-6">"{t.quote}"</blockquote>
                  <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                    <img src={t.photo} alt={t.name} className="w-11 h-11 rounded-full object-cover border-2 border-neutral-100" />
                    <div className="flex-1"><div className="font-bold text-neutral-900 text-sm">{t.name}</div><div className="text-xs text-neutral-500">{t.role} · {t.district}</div></div>
                    <div className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">{t.stat}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section ref={ctaSection.ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-12 ${ctaSection.inView ? 'animate-fade-up' : 'opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900">Ready to get started?</h2>
            <p className="mt-4 text-xl text-neutral-500">Join thousands of farmers and buyers transforming Indian agriculture.</p>
          </div>
          <div className={`grid md:grid-cols-2 gap-6 ${ctaSection.inView ? 'animate-fade-up delay-200' : 'opacity-0'}`}>
            <div className="relative group rounded-3xl overflow-hidden shadow-xl">
              <img src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600&auto=format&fit=crop&q=80" alt="Farmer" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="text-xs font-bold uppercase tracking-widest mb-1 text-white/70">For Farmers</div>
                <h3 className="text-2xl font-extrabold mb-2">Start Selling Today</h3>
                <p className="text-sm text-white/80 mb-4">List your produce free. Reach buyers across India.</p>
                <Link to="/register?role=farmer" className="inline-flex items-center gap-2 bg-white text-primary font-bold px-5 py-2.5 rounded-xl hover:bg-neutral-100 transition-colors text-sm">
                  I'm a Farmer <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="relative group rounded-3xl overflow-hidden shadow-xl">
              <img src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80" alt="Produce" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="text-xs font-bold uppercase tracking-widest mb-1 text-white/70">For Buyers</div>
                <h3 className="text-2xl font-extrabold mb-2">Find Fresh Produce</h3>
                <p className="text-sm text-white/80 mb-4">Direct from verified farms. Transparent pricing.</p>
                <Link to="/register?role=buyer" className="inline-flex items-center gap-2 bg-white text-neutral-900 font-bold px-5 py-2.5 rounded-xl hover:bg-neutral-100 transition-colors text-sm">
                  I'm a Buyer <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
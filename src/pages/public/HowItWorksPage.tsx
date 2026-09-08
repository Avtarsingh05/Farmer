import React from 'react';
import { UserPlus, Box, Truck, DollarSign, Search, ShoppingCart, Smartphone, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      
      {/* Hero Banner */}
      <section className="bg-white border-b border-neutral-200 overflow-hidden relative">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=2000&auto=format&fit=crop&q=80" 
            alt="Farming" 
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative z-10 animate-fade-up">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6 tracking-tight">
            How KisanMitra Works
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 max-w-3xl mx-auto font-medium">
            A simple, transparent process connecting the farm directly to the table.
          </p>
        </div>
      </section>

      {/* For Farmers */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center animate-fade-up animate-delay-100">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest mb-4">For Farmers</span>
            <h2 className="text-4xl font-bold text-neutral-900">Start selling your harvest</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative max-w-6xl mx-auto">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-[2px] bg-neutral-100 -z-10" />
            
            {[
              { icon: UserPlus, title: "1. Register", desc: "Sign up and complete your farmer verification to build trust with buyers." },
              { icon: Box, title: "2. List Produce", desc: "Add your available crops, set your price, quantity, and upload photos." },
              { icon: Smartphone, title: "3. Receive Orders", desc: "Get notified instantly when buyers place orders for your produce." },
              { icon: DollarSign, title: "4. Fulfill & Earn", desc: "Deliver the produce and receive secure, timely payments directly." }
            ].map((step, idx) => (
              <div key={idx} className={`bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 relative z-10 text-center hover:-translate-y-1 transition-transform duration-300 animate-fade-up animate-delay-${200 + idx*100}`}>
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">{step.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center animate-fade-up animate-delay-500">
            <Link to="/register?role=farmer" className="inline-flex items-center gap-2 btn-primary text-lg px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all">
              Create Farmer Account <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* For Buyers */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=2000&auto=format&fit=crop&q=80" 
            alt="Produce" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-16 text-center animate-fade-up">
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-neutral-300 text-sm font-bold uppercase tracking-widest mb-4">For Buyers</span>
            <h2 className="text-4xl font-bold text-white">Source fresh ingredients directly</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative max-w-6xl mx-auto">
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-[2px] bg-white/10 -z-10" />
            
            {[
              { icon: Search, title: "1. Browse", desc: "Search our marketplace for specific crops, filter by quality, location, or price." },
              { icon: ShoppingCart, title: "2. Order", desc: "Add items to your cart from one or multiple verified farmers and checkout." },
              { icon: Truck, title: "3. Track", desc: "Monitor your order status as the farmer prepares your fresh produce." },
              { icon: Box, title: "4. Receive", desc: "Get fresh, traceable produce delivered directly to you." }
            ].map((step, idx) => (
              <div key={idx} className={`bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 relative z-10 text-center hover:bg-white/10 transition-colors duration-300 animate-fade-up animate-delay-${100 + idx*100}`}>
                <div className="w-20 h-20 bg-white/10 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-neutral-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center animate-fade-up animate-delay-500">
            <Link to="/register?role=buyer" className="inline-flex items-center gap-2 bg-white text-neutral-900 font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-neutral-100 transition-colors">
              Create Buyer Account <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-up">
            <HelpCircle className="w-16 h-16 text-primary mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl font-bold text-neutral-900">Frequently Asked Questions</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { q: "How are prices determined?", a: "Farmers have complete control over setting their prices. We display current APMC (mandi) reference prices to help both farmers and buyers make informed decisions, but the final listing price is set by the farmer." },
              { q: "Who handles the delivery?", a: "Currently, delivery arrangements are coordinated directly between the farmer and the buyer upon order confirmation. Many farmers handle local deliveries themselves or use third-party logistics." },
              { q: "How does verification work?", a: "Our team verifies farmers by checking their agricultural land records, basic identity documents, and conducting random on-site or video checks to ensure authenticity and quality." },
              { q: "Is there a commission fee?", a: "We charge a minimal transparent platform fee on successful transactions to keep the platform running. This fee is significantly lower than traditional mandi commissions or middleman margins." }
            ].map((faq, idx) => (
              <div key={idx} className={`bg-neutral-50 p-8 rounded-2xl border border-neutral-100 hover:border-neutral-200 transition-colors animate-fade-up animate-delay-${idx*100}`}>
                <h3 className="text-xl font-bold text-neutral-900 mb-4">{faq.q}</h3>
                <p className="text-neutral-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HowItWorksPage;

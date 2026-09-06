import React from 'react';
import { UserPlus, Box, Truck, DollarSign, Search, ShoppingCart, Smartphone, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      
      {/* Hero */}
      <section className="bg-white py-16 px-4 border-b border-neutral-200 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">How KisanMitra Works</h1>
        <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
          A simple, transparent process connecting the farm directly to the table.
        </p>
      </section>

      {/* For Farmers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center md:text-left">
            <p className="text-sm font-bold uppercase tracking-wider text-primary mb-2">For Farmers</p>
            <h2 className="text-3xl font-bold text-neutral-900">Start selling your harvest</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-1/8 right-1/8 h-0.5 bg-neutral-200 -z-10 w-3/4 mx-auto" />
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100 relative z-10 text-center md:text-left space-y-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto md:mx-0">
                <UserPlus className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">1. Register</h3>
              <p className="text-neutral-600 text-sm">Sign up and complete your farmer verification to build trust with buyers.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100 relative z-10 text-center md:text-left space-y-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto md:mx-0">
                <Box className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">2. List Produce</h3>
              <p className="text-neutral-600 text-sm">Add your available crops, set your price, quantity, and upload photos.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100 relative z-10 text-center md:text-left space-y-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto md:mx-0">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">3. Receive Orders</h3>
              <p className="text-neutral-600 text-sm">Get notified instantly when buyers place orders for your produce.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100 relative z-10 text-center md:text-left space-y-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto md:mx-0">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">4. Fulfill & Earn</h3>
              <p className="text-neutral-600 text-sm">Deliver the produce and receive secure, timely payments directly.</p>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <Link to="/register?role=farmer" className="btn-primary">Create Farmer Account</Link>
          </div>
        </div>
      </section>

      {/* For Buyers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-200">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center md:text-right">
            <p className="text-sm font-bold uppercase tracking-wider text-primary mb-2">For Buyers</p>
            <h2 className="text-3xl font-bold text-neutral-900">Source fresh ingredients directly</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/8 right-1/8 h-0.5 bg-neutral-200 -z-10 w-3/4 mx-auto" />
            
            <div className="bg-neutral-50 p-6 rounded-xl shadow-sm border border-neutral-100 relative z-10 text-center md:text-left space-y-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto md:mx-0">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">1. Browse</h3>
              <p className="text-neutral-600 text-sm">Search our marketplace for specific crops, filter by quality, location, or price.</p>
            </div>

            <div className="bg-neutral-50 p-6 rounded-xl shadow-sm border border-neutral-100 relative z-10 text-center md:text-left space-y-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto md:mx-0">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">2. Order</h3>
              <p className="text-neutral-600 text-sm">Add items to your cart from one or multiple verified farmers and checkout.</p>
            </div>

            <div className="bg-neutral-50 p-6 rounded-xl shadow-sm border border-neutral-100 relative z-10 text-center md:text-left space-y-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto md:mx-0">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">3. Track</h3>
              <p className="text-neutral-600 text-sm">Monitor your order status as the farmer prepares your fresh produce.</p>
            </div>

            <div className="bg-neutral-50 p-6 rounded-xl shadow-sm border border-neutral-100 relative z-10 text-center md:text-left space-y-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto md:mx-0">
                <Box className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">4. Receive</h3>
              <p className="text-neutral-600 text-sm">Get fresh, traceable produce delivered directly to you.</p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link to="/register?role=buyer" className="btn-secondary">Create Buyer Account</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-neutral-900">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-2">How are prices determined?</h3>
              <p className="text-neutral-600">Farmers have complete control over setting their prices. We display current APMC (mandi) reference prices to help both farmers and buyers make informed decisions, but the final listing price is set by the farmer.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Who handles the delivery?</h3>
              <p className="text-neutral-600">Currently, delivery arrangements are coordinated directly between the farmer and the buyer upon order confirmation. Many farmers handle local deliveries themselves or use third-party logistics.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-2">How does verification work?</h3>
              <p className="text-neutral-600">Our team verifies farmers by checking their agricultural land records, basic identity documents, and conducting random on-site or video checks to ensure authenticity and quality.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Is there a commission fee?</h3>
              <p className="text-neutral-600">We charge a minimal transparent platform fee on successful transactions to keep the platform running. This fee is significantly lower than traditional mandi commissions or middleman margins.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HowItWorksPage;

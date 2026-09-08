import { getPlatformSettings } from '@/services/settingsService';
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Shield, BadgeCheck } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const { logoUrl } = getPlatformSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Trust bar */}
      <div className="border-b border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center md:justify-between gap-6 text-sm text-neutral-400">
            {[
              { icon: BadgeCheck, label: '500+ APMC-verified farmers' },
              { icon: Shield,     label: 'Zero broker commissions' },
              { icon: MapPin,     label: '28 states across India' },
              { icon: Mail,       label: 'support@kisanmitra.in' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                
              </div>
              <span className="text-xl font-extrabold text-white">KisanMitra</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
              India's direct farm-to-market platform. Empowering farmers with fair prices, giving buyers transparent produce at the source.
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Phone className="w-3.5 h-3.5" />
              <span>Farmer Helpline: 1800-XXX-XXXX (toll-free)</span>
            </div>
            {/* APMC badge */}
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
              <Shield className="w-3.5 h-3.5" />
              APMC Benchmark Prices · Agmarknet Sourced
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-xs font-bold text-neutral-300 tracking-widest uppercase mb-5">Platform</h3>
            <ul className="space-y-3">
              {[
                { label: 'Browse Market',    to: '/market' },
                { label: 'How It Works',     to: '/how-it-works' },
                { label: 'For Farmers',      to: '/farmers' },
                { label: 'For Buyers',       to: '/register?role=buyer' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-neutral-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-bold text-neutral-300 tracking-widest uppercase mb-5">Company</h3>
            <ul className="space-y-3">
              {[
                { label: 'About Us',         to: '/about' },
                { label: 'Privacy Policy',   to: '/privacy' },
                { label: 'Terms of Service', to: '/terms' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-neutral-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-bold text-neutral-300 tracking-widest uppercase mb-5">Support</h3>
            <ul className="space-y-3">
              {[
                { label: 'Help Center', to: '/help' },
                { label: 'FAQ',         to: '/faq' },
                { label: 'Contact Us',  to: '/contact' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-neutral-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            &copy; {currentYear} KisanMitra Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-xs text-neutral-600">
            Prices sourced from Agmarknet (National Agriculture Market) APMC daily bulletins.
          </p>
        </div>
      </div>
    </footer>
  );
};


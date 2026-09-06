import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Globe, ExternalLink } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-neutral-200 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-primary">KisanMitra</span>
            </div>
            <p className="text-neutral-600 text-sm">
              Empowering farmers with direct market access and fair prices.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link to="/market" className="text-sm text-neutral-600 hover:text-primary">Market</Link></li>
              <li><Link to="/how-it-works" className="text-sm text-neutral-600 hover:text-primary">How it works</Link></li>
              <li><Link to="/for-farmers" className="text-sm text-neutral-600 hover:text-primary">For Farmers</Link></li>
              <li><Link to="/for-buyers" className="text-sm text-neutral-600 hover:text-primary">For Buyers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-neutral-600 hover:text-primary">About</Link></li>
              <li><Link to="/contact" className="text-sm text-neutral-600 hover:text-primary">Contact</Link></li>
              <li><Link to="/privacy" className="text-sm text-neutral-600 hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-neutral-600 hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-sm text-neutral-600 hover:text-primary">Help Center</Link></li>
              <li><Link to="/faq" className="text-sm text-neutral-600 hover:text-primary">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-neutral-600">
            &copy; {currentYear} KisanMitra. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-neutral-400 hover:text-primary">
              <span className="sr-only">Website</span>
              <Globe className="h-5 w-5" />
            </a>
            <a href="#" className="text-neutral-400 hover:text-primary">
              <span className="sr-only">Mail</span>
              <Mail className="h-5 w-5" />
            </a>
            <a href="#" className="text-neutral-400 hover:text-primary">
              <span className="sr-only">External</span>
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Menu, X, ShoppingCart } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GooeyNav, type GooeyNavItem } from '@/components/ui';
import { useCart, useAuth } from '@/hooks';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

export const PublicTopNav: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Market', path: '/market' },
    { label: 'Farmers', path: '/farmers' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About', path: '/about' },
  ];

  const currentPath = location.pathname;
  const activeNavIndex = navLinks.findIndex((l) =>
    l.path === '/' ? currentPath === '/' : currentPath.startsWith(l.path)
  );

  const gooeyItems: GooeyNavItem[] = navLinks.map((link) => ({
    label: link.label,
    href: link.path,
    onClick: (e) => {
      e.preventDefault();
      navigate(link.path);
    },
  }));

  return (
    <header className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300', isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-neutral-200/60' : 'bg-transparent border-b border-transparent')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 cursor-pointer shrink-0" onClick={() => navigate('/')}>
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">KisanMitra</span>
          </div>

          {/* Desktop GooeyNav Navigation */}
          <div className="hidden md:flex items-center justify-center">
            <GooeyNav
              items={gooeyItems}
              activeIndex={activeNavIndex >= 0 ? activeNavIndex : 0}
              animationTime={500}
              particleCount={14}
              particleDistances={[75, 12]}
              particleR={85}
              colors={[1, 2, 3, 1, 2, 4]}
            />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => navigate('/buyer/cart')}
              className="relative p-2.5 rounded-full text-neutral-700 hover:text-primary hover:bg-neutral-100/80 transition-colors"
              aria-label={`Cart with ${itemCount} items`}
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>
            {user ? (
              <button
                onClick={() => {
                  if (user.role === 'admin') navigate('/admin');
                  else if (user.role === 'farmer') navigate('/farmer');
                  else navigate('/buyer');
                }}
                className={cn(
                  "btn-primary flex items-center gap-1.5 shadow-sm font-medium",
                  user.role === 'admin' && "bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-800"
                )}
              >
                {user.role === 'admin' && '🛡️ Admin Panel'}
                {user.role === 'farmer' && '👨‍🌾 Farmer Dashboard'}
                {user.role === 'buyer' && '🛒 Buyer Dashboard'}
              </button>
            ) : (
              <>
                <button className="btn-secondary bg-white/85 backdrop-blur-sm hover:bg-white border-neutral-200/80" onClick={() => navigate('/login')}>Login</button>
                <button className="btn-primary shadow-sm" onClick={() => navigate('/register')}>Get Started</button>
              </>
            )}
          </div>

          {/* Mobile Actions & Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => navigate('/buyer/cart')}
              className="relative p-2 rounded-full text-neutral-700 hover:text-primary transition-colors"
              aria-label={`Cart with ${itemCount} items`}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-neutral-600 hover:text-primary focus:outline-none p-1"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl h-full slide-in-left">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4 space-x-2">
                <Leaf className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-primary">KisanMitra</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn('block px-3 py-2 rounded-md text-base font-medium', isActive ? 'text-primary bg-neutral-50' : 'text-neutral-900 hover:bg-neutral-50 hover:text-primary')
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <NavLink
                  to="/buyer/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn('flex items-center justify-between px-3 py-2 rounded-md text-base font-medium', isActive ? 'text-primary bg-neutral-50' : 'text-neutral-900 hover:bg-neutral-50 hover:text-primary')
                  }
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Cart
                  </span>
                  {itemCount > 0 && (
                    <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {itemCount}
                    </span>
                  )}
                </NavLink>
              </nav>
            </div>
            <div className="flex-shrink-0 flex flex-col p-4 border-t border-neutral-200 space-y-3">
              {user ? (
                <button
                  className={cn(
                    "btn-primary w-full",
                    user.role === 'admin' && "bg-neutral-900 hover:bg-neutral-800 text-white"
                  )}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (user.role === 'admin') navigate('/admin');
                    else if (user.role === 'farmer') navigate('/farmer');
                    else navigate('/buyer');
                  }}
                >
                  {user.role === 'admin' && '🛡️ Admin Panel'}
                  {user.role === 'farmer' && '👨‍🌾 Farmer Dashboard'}
                  {user.role === 'buyer' && '🛒 Buyer Dashboard'}
                </button>
              ) : (
                <>
                  <button className="btn-primary w-full" onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }}>Get Started</button>
                  <button className="btn-secondary w-full" onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}>Login</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

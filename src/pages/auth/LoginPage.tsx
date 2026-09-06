import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { loginSchema } from '@/schemas/auth.schema';
import { z } from 'zod';
import { RequireGuest } from '@/app/RouteGuards';

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, loginAsDemo } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    setAuthError(null);
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (error: any) {
      setAuthError(error.message || 'Failed to login');
    }
  };

  const handleDemoLogin = async (role: 'farmer' | 'buyer' | 'admin') => {
    await loginAsDemo(role);
    if (role === 'farmer') navigate('/farmer');
    else if (role === 'buyer') navigate('/buyer');
    else navigate('/admin');
  };

  return (
    <RequireGuest>
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="card w-full max-w-md p-8 bg-white rounded-xl shadow-md border border-neutral-200">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary mb-1">KisanMitra</h1>
            <h2 className="text-lg font-semibold text-neutral-900">Sign in to your account</h2>
            <p className="text-sm text-neutral-500 mt-1">Direct Farm-to-Buyer Marketplace</p>
          </div>

          {/* Quick 1-Click Demo Login */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3.5 mb-6">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant 1-Click Demo Access</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('farmer')}
                className="py-2 px-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg font-medium text-xs shadow-sm transition-all flex flex-col items-center justify-center text-center"
              >
                <span className="font-semibold">👨‍🌾 Farmer</span>
                <span className="text-[10px] text-emerald-100 mt-0.5">Ramesh Patel</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('buyer')}
                className="py-2 px-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg font-medium text-xs shadow-sm transition-all flex flex-col items-center justify-center text-center"
              >
                <span className="font-semibold">🛒 Buyer</span>
                <span className="text-[10px] text-blue-100 mt-0.5">Priya Sharma</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="py-2 px-1.5 bg-neutral-800 hover:bg-neutral-900 active:scale-95 text-white rounded-lg font-medium text-xs shadow-sm transition-all flex flex-col items-center justify-center text-center"
              >
                <span className="font-semibold">🛡️ Admin</span>
                <span className="text-[10px] text-neutral-300 mt-0.5">Platform</span>
              </button>
            </div>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-6 text-sm">
              {authError}
            </div>
          )}

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-neutral-400 font-medium">Or enter credentials</span></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label block mb-1 font-medium text-neutral-700 text-sm">Email Address</label>
              <input 
                id="email" 
                type="email" 
                placeholder="farmer@kisanmitra.in"
                className={`form-input w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow ${errors.email ? 'border-red-500' : 'border-neutral-300'}`}
                {...register('email')} 
              />
              {errors.email && <p className="form-error text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="form-label font-medium text-neutral-700 text-sm">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className={`form-input w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow pr-10 ${errors.password ? 'border-red-500' : 'border-neutral-300'}`}
                  {...register('password')} 
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="form-error text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn-primary w-full py-2.5 rounded-lg flex items-center justify-center font-medium shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </RequireGuest>
  );
}

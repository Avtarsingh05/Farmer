import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Sprout, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { registerSchema } from '@/schemas/auth.schema';
import { z } from 'zod';
import { RequireGuest } from '@/app/RouteGuards';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'farmer'
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    setAuthError(null);
    try {
      await registerUser(data);
      if (data.role === 'farmer') {
        navigate('/farmer/profile');
      } else {
        navigate('/buyer');
      }
    } catch (error: any) {
      setAuthError(error.message || 'Failed to register account');
    }
  };

  return (
    <RequireGuest>
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 py-12">
        <div className="card w-full max-w-md p-8 bg-white rounded-lg shadow-md border border-neutral-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">KisanMitra</h1>
            <h2 className="text-xl font-semibold text-neutral-900">Create your account</h2>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-6 text-sm">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="form-label block mb-1 font-medium text-neutral-700">I want to...</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue('role', 'farmer', { shouldValidate: true })}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all cursor-pointer outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    selectedRole === 'farmer' 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-primary/50"
                  )}
                >
                  <Sprout size={32} className="mb-2" />
                  <span className="font-semibold">Sell produce</span>
                </button>
                <button
                  type="button"
                  onClick={() => setValue('role', 'buyer', { shouldValidate: true })}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all cursor-pointer outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    selectedRole === 'buyer' 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-primary/50"
                  )}
                >
                  <ShoppingBag size={32} className="mb-2" />
                  <span className="font-semibold">Buy produce</span>
                </button>
              </div>
              {errors.role && <p className="form-error text-red-500 text-sm mt-1">{errors.role.message}</p>}
            </div>

            <div>
              <label htmlFor="name" className="form-label block mb-1 font-medium text-neutral-700">Full name</label>
              <input 
                id="name" 
                type="text" 
                className={`form-input w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow ${errors.name ? 'border-red-500' : 'border-neutral-300'}`}
                {...register('name')} 
              />
              {errors.name && <p className="form-error text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="form-label block mb-1 font-medium text-neutral-700">Email</label>
              <input 
                id="email" 
                type="email" 
                className={`form-input w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow ${errors.email ? 'border-red-500' : 'border-neutral-300'}`}
                {...register('email')} 
              />
              {errors.email && <p className="form-error text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="form-label block mb-1 font-medium text-neutral-700">
                Mobile number <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input 
                id="phone" 
                type="tel" 
                className={`form-input w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow ${errors.phone ? 'border-red-500' : 'border-neutral-300'}`}
                {...register('phone')} 
              />
              {errors.phone && <p className="form-error text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="form-label block mb-1 font-medium text-neutral-700">Password</label>
              <div className="relative">
                <input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  className={`form-input w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow pr-10 ${errors.password ? 'border-red-500' : 'border-neutral-300'}`}
                  {...register('password')} 
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-700 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="form-error text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label block mb-1 font-medium text-neutral-700">Confirm password</label>
              <div className="relative">
                <input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  className={`form-input w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow pr-10 ${errors.confirmPassword ? 'border-red-500' : 'border-neutral-300'}`}
                  {...register('confirmPassword')} 
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-700 focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="form-error text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full py-2 mt-4 bg-primary text-white rounded-md font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </RequireGuest>
  );
};

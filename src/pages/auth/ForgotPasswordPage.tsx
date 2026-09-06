import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { forgotPasswordSchema } from '@/schemas/auth.schema';
import { z } from 'zod';
import { RequireGuest } from '@/app/RouteGuards';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { sendPasswordReset } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setAuthError(null);
    try {
      await sendPasswordReset(data.email);
      setIsSuccess(true);
    } catch (error: any) {
      setAuthError(error.message || 'Failed to send reset link. Please try again.');
    }
  };

  return (
    <RequireGuest>
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="card w-full max-w-md p-8 bg-white rounded-lg shadow-md border border-neutral-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">KisanMitra</h1>
            <h2 className="text-xl font-semibold text-neutral-900">Reset your password</h2>
            {!isSuccess && (
              <p className="text-neutral-600 mt-2 text-sm">
                Enter your email and we will send you a reset link.
              </p>
            )}
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-6 text-sm">
              {authError}
            </div>
          )}

          {isSuccess ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
              <p className="text-neutral-700 mb-6 font-medium">
                Check your email. We sent a reset link to <br/>
                <span className="font-bold text-neutral-900">{getValues('email')}</span>
              </p>
              <Link 
                to="/login" 
                className="btn-primary w-full inline-block py-2 bg-primary text-white rounded-md font-semibold hover:bg-opacity-90 transition-colors"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

              <button 
                type="submit" 
                className="btn-primary w-full py-2 bg-primary text-white rounded-md font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {!isSuccess && (
            <div className="mt-8 flex justify-center">
              <Link to="/login" className="text-primary hover:underline font-semibold flex items-center gap-1 text-sm">
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </RequireGuest>
  );
};

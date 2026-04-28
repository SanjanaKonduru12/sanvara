import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api, { getApiErrorMessage } from '../services/api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
      showToast({ title: 'OTP Sent', message: 'Check your email for the OTP.', tone: 'success' });
      setStep(2);
    } catch (error) {
      showToast({ title: 'Error', message: getApiErrorMessage(error, 'Failed to send OTP.'), tone: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      showToast({ title: 'OTP Verified', message: 'You can now reset your password.', tone: 'success' });
      setStep(3);
    } catch (error) {
      showToast({ title: 'Invalid OTP', message: getApiErrorMessage(error, 'OTP verification failed.'), tone: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      showToast({ title: 'Password Reset', message: 'Your password has been successfully reset. Please log in.', tone: 'success' });
      navigate('/login');
    } catch (error) {
      showToast({ title: 'Error', message: getApiErrorMessage(error, 'Failed to reset password.'), tone: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-100px)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-[36px] border border-slate-200/80 bg-white/95 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900/90 sm:p-10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Forgot Password</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {step === 1 && "Enter your email to receive an OTP."}
            {step === 2 && "Enter the 6-digit OTP sent to your email."}
            {step === 3 && "Create a new password."}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="inline-flex w-full justify-center rounded-full bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-70"
            >
              {isSubmitting ? <LoadingSpinner inline /> : 'Send OTP'}
            </button>
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">Back to Login</Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">OTP Code</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-center text-lg tracking-[0.5em] text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className="inline-flex w-full justify-center rounded-full bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-70"
            >
              {isSubmitting ? <LoadingSpinner inline /> : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                placeholder="••••••••"
                minLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || newPassword.length < 8}
              className="inline-flex w-full justify-center rounded-full bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-70"
            >
              {isSubmitting ? <LoadingSpinner inline /> : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

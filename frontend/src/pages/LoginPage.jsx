import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api, { getApiErrorMessage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LoginPage({ auth, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  // Redirect if already authenticated
  if (auth) {
    return <Navigate to="/" replace />;
  }

  const sessionExpired = searchParams.get('reason') === 'session-expired';
  const redirectTo = searchParams.get('redirect') || '/profile';

  const validate = () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setError('Please enter your password.');
      return false;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email: email.trim(), password });
      onLogin(response.data, redirectTo);
      showToast({
        title: 'Welcome back!',
        message: 'You have been signed in successfully.',
        tone: 'success',
      });
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Unable to sign in. Please check your credentials.');
      setError(message);
      showToast({ title: 'Sign-in failed', message, tone: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto w-full max-w-md rounded-[36px] border border-slate-200/80 bg-white/95 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900/90 sm:p-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_var(--color-accent),_#0f172a)] text-white shadow-soft">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
              <path d="M15 8a4 4 0 1 0-8 0c0 4 8 3 8 7a4 4 0 1 1-8 0" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-slate-900 dark:text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sign in to your Sanvara account
          </p>
        </div>

        {/* Session expired banner */}
        {sessionExpired && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            Your session has expired. Please sign in again.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <span className="font-medium">Email</span>
            <input
              value={email}
              onChange={(event) => { setEmail(event.target.value); setError(''); }}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="field"
            />
          </label>
          <label className="block space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <div className="flex justify-between items-center">
              <span className="font-medium">Password</span>
              <Link to="/forgot-password" className="text-xs text-[var(--color-accent)] hover:underline">Forgot password?</Link>
            </div>
            <input
              value={password}
              onChange={(event) => { setPassword(event.target.value); setError(''); }}
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              className="field"
            />
          </label>

          {/* Error message */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full justify-center py-3.5"
          >
            {isLoading ? <LoadingSpinner inline /> : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[var(--color-accent)] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

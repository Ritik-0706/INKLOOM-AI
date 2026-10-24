import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@inkloom.ai');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setError(null);
    setIsLoading(true);
    try {
      await switchDemoRole(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Could not log in with demo account. Please ensure database is seeded.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-inkloom-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-inkloom-primary/20">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-inkloom-primary to-inkloom-secondary flex items-center justify-center text-white shadow-glow-primary">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-inkloom-primary to-inkloom-secondary bg-clip-text text-transparent">
            Inkloom AI
          </span>
        </Link>
        <h2 className="text-2xl font-black text-inkloom-text">Sign in to your account</h2>
        <p className="mt-1 text-xs text-inkloom-muted">
          Enterprise brand compliance and governance workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card-soft rounded-3xl sm:px-10 border border-inkloom-border">
          {/* Quick Demo Persona Switcher */}
          <div className="mb-6 pb-6 border-b border-inkloom-border">
            <div className="text-[11px] font-bold text-inkloom-muted uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Quick 1-Click Demo Login</span>
              <span className="text-[10px] text-inkloom-primary font-semibold">Test Any Role</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2 text-left rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <div className="text-xs font-bold text-purple-900">Admin</div>
                <div className="text-[10px] text-purple-600">Sarah Chen</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('approver')}
                className="p-2 text-left rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <div className="text-xs font-bold text-amber-900">Approver</div>
                <div className="text-[10px] text-amber-600">Marcus Vance</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('manager')}
                className="p-2 text-left rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <div className="text-xs font-bold text-blue-900">Manager</div>
                <div className="text-[10px] text-blue-600">Elena Rostova</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('creator')}
                className="p-2 text-left rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <div className="text-xs font-bold text-emerald-900">Creator</div>
                <div className="text-[10px] text-emerald-600">Alex Rivera</div>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-inkloom-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-inkloom-text mb-1">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-inkloom-border bg-inkloom-bg/40 text-xs focus:ring-2 focus:ring-inkloom-primary/20 focus:border-inkloom-primary outline-none transition-all"
                  placeholder="name@company.com"
                />
                <Mail className="w-4 h-4 text-inkloom-muted absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-inkloom-text mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-inkloom-border bg-inkloom-bg/40 text-xs focus:ring-2 focus:ring-inkloom-primary/20 focus:border-inkloom-primary outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-inkloom-muted absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-inkloom-primary to-inkloom-secondary hover:from-inkloom-primaryHover hover:to-blue-600 shadow-glow-primary transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-inkloom-muted">
            Don't have an organization yet?{' '}
            <Link to="/register" className="font-bold text-inkloom-primary hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

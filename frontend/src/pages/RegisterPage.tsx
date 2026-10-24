import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, User, Building, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [role, setRole] = useState('creator');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        organization_name: orgName,
        role
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Check details.');
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
        <h2 className="text-2xl font-black text-inkloom-text">Create your organization</h2>
        <p className="mt-1 text-xs text-inkloom-muted">
          Start reviewing and governing content with deterministic precision
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card-soft rounded-3xl sm:px-10 border border-inkloom-border">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-inkloom-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-inkloom-text mb-1">Full name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-inkloom-border bg-inkloom-bg/40 text-xs focus:ring-2 focus:ring-inkloom-primary/20 focus:border-inkloom-primary outline-none"
                  placeholder="Jordan Taylor"
                />
                <User className="w-4 h-4 text-inkloom-muted absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-inkloom-text mb-1">Work Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-inkloom-border bg-inkloom-bg/40 text-xs focus:ring-2 focus:ring-inkloom-primary/20 focus:border-inkloom-primary outline-none"
                  placeholder="jordan@company.com"
                />
                <Mail className="w-4 h-4 text-inkloom-muted absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-inkloom-text mb-1">Organization Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-inkloom-border bg-inkloom-bg/40 text-xs focus:ring-2 focus:ring-inkloom-primary/20 focus:border-inkloom-primary outline-none"
                  placeholder="Acme Technologies Corp"
                />
                <Building className="w-4 h-4 text-inkloom-muted absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-inkloom-text mb-1">Initial Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-inkloom-border bg-inkloom-bg/40 text-xs focus:ring-2 focus:ring-inkloom-primary/20 focus:border-inkloom-primary outline-none"
              >
                <option value="admin">Admin (Full Control)</option>
                <option value="approver">Approver (Review & Sign-off)</option>
                <option value="manager">Manager (Strategy & Oversight)</option>
                <option value="creator">Creator (Drafts & Content)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-inkloom-text mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-inkloom-border bg-inkloom-bg/40 text-xs focus:ring-2 focus:ring-inkloom-primary/20 focus:border-inkloom-primary outline-none"
                  placeholder="••••••••"
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
                <span>Setting up workspace...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-inkloom-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-inkloom-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

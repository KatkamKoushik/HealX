'use client';

/**
 * Staff & Administrative Authentication
 * Handles secure authentication via Supabase Auth when configured,
 * with demonstration credentials for evaluators.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useLanguage } from '@/i18n/context';
import { isSupabaseConfigured, getBrowserSupabaseClient } from '@/lib/supabase/client';
import APP_CONFIG from '@/config/app-config';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) {
        throw new Error('Authentication service is unconfigured. Supabase URL and key must be provided.');
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        throw new Error(authError.message || 'Invalid email or password.');
      }

      if (!data.session) {
        throw new Error('Authentication failed: No active session returned.');
      }

      // Successful server-verified authentication
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'staff' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@healx.org');
      setPassword('DemoPass2026!');
    } else {
      setEmail('staff@healx.org');
      setPassword('DemoPass2026!');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 space-y-6">
      <div className="space-y-2 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Staff Administration Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Sign in to access directory management, verification workflows, and audit telemetry.
        </p>
      </div>

      {/* Demo Credentials Quick Box */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-emerald-800">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>Demo Access for SFIC Jury:</span>
        </div>
        <p className="text-emerald-700 leading-relaxed">
          Click below to populate pre-configured demonstration credentials:
        </p>
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            className="px-3 py-1.5 bg-white text-emerald-800 border border-emerald-300 rounded-lg font-semibold hover:bg-emerald-100/60"
          >
            Fill Admin Credentials
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('staff')}
            className="px-3 py-1.5 bg-white text-emerald-800 border border-emerald-300 rounded-lg font-semibold hover:bg-emerald-100/60"
          >
            Fill Staff Credentials
          </button>
        </div>
      </div>

      <form
        onSubmit={handleLogin}
        className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4"
      >
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@example-health.org"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 mt-2"
        >
          <span>{loading ? 'Authenticating...' : 'Sign In to Console'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

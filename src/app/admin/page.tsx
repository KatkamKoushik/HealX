'use client';

/**
 * Staff Administration Console Overview
 * Displays high-level platform status, verification ratios, active integrations health,
 * and quick access to core administrative workflows.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  PhoneCall,
  Server,
  Sparkles,
  Layers,
  ArrowRight,
  Database,
} from 'lucide-react';
import APP_CONFIG from '@/config/app-config';

export default function AdminOverviewPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [resAnalytics, resStatus] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/status'),
        ]);

        const dataAnalytics = await resAnalytics.json();
        const dataStatus = await resStatus.json();

        setAnalytics(dataAnalytics.data);
        setSystemStatus(dataStatus.data);
      } catch {
        // error handling
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Staff Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Management & Verification Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Monitor healthcare directory coverage, perform verification reviews, and audit platform telephony.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/verification"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Review Pending Verifications</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hospitals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Facilities</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">
            {loading ? '...' : analytics?.totalHospitals || 0}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {analytics?.activeHospitals || 0} currently publicly active
          </div>
        </div>

        {/* Verification Coverage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Verified Coverage</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
            {loading ? '...' : `${analytics?.verificationCoveragePercent || 0}%`}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            {analytics?.verifiedHospitals || 0} of {analytics?.totalHospitals || 0} facilities verified
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Needs Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600">
            {loading ? '...' : analytics?.needsReviewHospitals || 0}
          </div>
          <div className="text-[11px] text-amber-700 font-medium">
            Requires field survey or phone check
          </div>
        </div>

        {/* Citizen Rating */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Average Satisfaction</span>
            <MessageSquare className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">
            {loading ? '...' : `${analytics?.averageSatisfactionRating || 0} / 5`}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Based on {analytics?.totalFeedback || 0} citizen ratings
          </div>
        </div>
      </div>

      {/* Integration & Data Source Status Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              External Services & Subsystems Configuration
            </h2>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
            Active Data: {systemStatus?.activeDataSource || 'Local Demo Mode'}
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Safe runtime configuration overview. Credential tokens are strictly kept on the server and never revealed to the browser.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Supabase Status */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Supabase DB</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                  systemStatus?.integrations?.supabase?.configured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {systemStatus?.integrations?.supabase?.configured ? 'Connected' : 'Demo Fallback'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {systemStatus?.integrations?.supabase?.configured
                ? 'Connected to Supabase PostgreSQL cloud instance.'
                : 'Using in-memory repository with full CRUD support.'}
            </p>
          </div>

          {/* Gemini AI Status */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Gemini AI (Primary)</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                  systemStatus?.integrations?.gemini?.configured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {systemStatus?.integrations?.gemini?.configured ? 'Active' : 'Unconfigured'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {systemStatus?.integrations?.gemini?.configured
                ? 'Gemini 1.5 Flash grounded assistant ready.'
                : 'Unconfigured; falls over to Grok or local fallback.'}
            </p>
          </div>

          {/* Grok AI Status */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Grok AI (Failover)</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                  systemStatus?.integrations?.grok?.configured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {systemStatus?.integrations?.grok?.configured ? 'Active' : 'Unconfigured'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {systemStatus?.integrations?.grok?.configured
                ? 'Grok-beta ready as automatic waterfall failover.'
                : 'Unconfigured; deterministic local fallback active.'}
            </p>
          </div>

          {/* SMS / Twilio Status */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>SMS Subsystem</span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-blue-100 text-blue-800">
                {APP_CONFIG.sms.mode === 'real' ? 'Twilio Real' : 'Mock Mode'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {APP_CONFIG.sms.mode === 'real'
                ? 'Outbound cellular dispatch enabled via Twilio API.'
                : 'Simulates outbound dispatch and audits logs.'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/verification"
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-sm transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            Data Verification Queue
          </h3>
          <p className="text-xs text-slate-600">
            Review unverified healthcare facilities, inspect field visit sources, and transition statuses with audit notes.
          </p>
        </Link>

        <Link
          href="/admin/ivr"
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-sm transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
            Interactive IVR Simulator
          </h3>
          <p className="text-xs text-slate-600">
            Simulate incoming telephony callers navigating hospital and department options via speech audio and dialpad digits.
          </p>
        </Link>

        <Link
          href="/admin/notifications"
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-sm transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
            SMS Notification Inspector
          </h3>
          <p className="text-xs text-slate-600">
            Preview facility emergency alert templates, trigger simulated dispatches, and review cellular delivery logs.
          </p>
        </Link>
      </div>
    </div>
  );
}

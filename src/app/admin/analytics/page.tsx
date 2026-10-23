'use client';

/**
 * Social Impact & Analytics Dashboard
 * Tracks public health navigation indicators, verification coverage,
 * AI failover occurrences, and user satisfaction metrics.
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Users,
  Search,
  MessageSquare,
  Sparkles,
  Info,
  Radio,
  FileCheck,
} from 'lucide-react';

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/analytics');
        const json = await res.json();
        setData(json.data);
      } catch {
        // error handling
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Theme 3: Swasth & Samavesh Bharat</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Impact Metrics & Telemetry Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Evaluating digital healthcare navigation efficacy, language inclusion, and data verification confidence.
          </p>
        </div>
      </div>

      {/* Methodology Disclaimer Notice */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-slate-800">Telemetry Classification & Methodology:</strong>
          <p className="leading-relaxed">
            Metrics below are categorized into <strong>Observed Prototype Interactions</strong> (real session counts), <strong>User-Submitted Ratings</strong> (feedback submitted by testers), and <strong>Seeded Demonstration Baselines</strong>. We do not claim unverified clinical waiting time reductions without measured evidence.
          </p>
        </div>
      </div>

      {/* Primary Indicator Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Directory Searches */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Directory Queries</span>
            <Search className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">
            {loading ? '...' : data?.totalSearches || 0}
          </div>
          <div className="text-[11px] text-slate-500">
            Hospital & department lookup queries
          </div>
        </div>

        {/* Verification Coverage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Verified Confidence</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
            {loading ? '...' : `${data?.verificationCoveragePercent || 0}%`}
          </div>
          <div className="text-[11px] text-emerald-800">
            {data?.verifiedHospitals || 0} of {data?.totalHospitals || 0} facilities verified
          </div>
        </div>

        {/* AI Assisted Queries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>AI Navigations</span>
            <Sparkles className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">
            {loading ? '...' : data?.aiQueriesCount || 0}
          </div>
          <div className="text-[11px] text-teal-800">
            {data?.aiFailoverCount || 0} waterfall failovers handled safely
          </div>
        </div>

        {/* SMS / IVR Telephony */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Alert Dispatches</span>
            <Radio className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">
            {loading ? '...' : data?.totalNotifications || 0}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {data?.simulatedNotifications || 0} simulated / {data?.realNotifications || 0} real
          </div>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verification Status Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
              Directory Verification Distribution
            </h2>
            <span className="text-xs text-slate-500">Facility Records</span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-800">Verified Facilities (Field Visit & Reg)</span>
                <span>{data?.verifiedHospitals || 0} Facilities</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${data?.totalHospitals ? (data.verifiedHospitals / data.totalHospitals) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-800">Needs Review (Outdated timings)</span>
                <span>{data?.needsReviewHospitals || 0} Facilities</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${data?.totalHospitals ? (data.needsReviewHospitals / data.totalHospitals) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Unverified (Self-Reported Baseline)</span>
                <span>{data?.unverifiedHospitals || 0} Facilities</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-slate-400 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${data?.totalHospitals ? (data.unverifiedHospitals / data.totalHospitals) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Methodology: Only facilities with documented field visits or telephone verification desk records obtain verified status.
          </div>
        </div>

        {/* Pilot Projection & Target Social Impact */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
              Level 3 Target Pilot Outcomes
            </h2>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Future Pilot Model
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Telugu Language Reach</span>
              <div className="text-xl font-bold text-slate-900">100% UI Native</div>
              <p className="text-[11px] text-slate-500">
                Eliminates mistranslation risks for clinical terms & hospital names.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Voice Inclusivity</span>
              <div className="text-xl font-bold text-slate-900">Zero Device Barrier</div>
              <p className="text-[11px] text-slate-500">
                Browser TTS & simulated IVR telephony enable access for low-literacy users.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Target Response Time</span>
              <div className="text-xl font-bold text-emerald-700">&lt; 1.5 seconds</div>
              <p className="text-[11px] text-slate-500">
                Fast grounded directory lookups without heavy diagnostic compute.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">AI Diagnostic Risk</span>
              <div className="text-xl font-bold text-emerald-700">0.0% Hallucination</div>
              <p className="text-[11px] text-slate-500">
                Strict boundaries block clinical diagnosis & medication advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

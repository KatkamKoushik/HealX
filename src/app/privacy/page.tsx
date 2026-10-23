/**
 * Privacy & Data Handling Notice
 * Accurately describes data practices, telemetry limits, and absence of personal medical collection.
 */

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, EyeOff, Server, ArrowLeft } from 'lucide-react';
import APP_CONFIG from '@/config/app-config';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Transparency Notice</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy & Data Handling Notice
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          How {APP_CONFIG.name} handles navigation queries, citizen feedback, and system logs.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>1. Zero Personal Health Information (PHI) Collection</span>
          </h2>
          <p>
            {APP_CONFIG.name} is strictly a public healthcare navigation and facility discovery platform. We do not require account creation to search hospitals or browse departments. We do not request, record, or process medical diagnostic histories, prescription details, Aadhaar numbers, or personal identifying records from patients or citizens.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-emerald-600" />
            <span>2. AI Assistant Interaction Privacy</span>
          </h2>
          <p>
            When asking questions to our AI Healthcare Navigation Assistant:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>User queries are validated for navigation relevance and transmitted over TLS to provider endpoints (Gemini or Grok).</li>
            <li>We do NOT store raw conversational prompts or personal details in persistent telemetry logs.</li>
            <li>We log only non-sensitive execution metrics: response latency, provider selected, and failover status.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-600" />
            <span>3. Anonymized Usage & Social Impact Telemetry</span>
          </h2>
          <p>
            To evaluate healthcare navigation accessibility for the Seva First Innovation Challenge, our analytics service collects anonymized counters: total facility searches, department views, and submitted feedback ratings. No IP addresses or device identifiers are tied to medical conditions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>4. Demonstration Scope & Regulatory Clarification</span>
          </h2>
          <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {APP_CONFIG.disclaimer} This application is an engineering prototype submitted to the Seva First Innovation Challenge (SFIC) Level 3. It is not an officially certified medical device or government registry.
          </p>
        </section>
      </div>
    </div>
  );
}

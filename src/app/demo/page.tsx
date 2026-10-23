'use client';

/**
 * Interactive Demonstration Guide for SFIC Evaluators & Judges
 * Showcases the complete patient journey and administrative console features
 * with interactive deep links to all application capabilities.
 */

import React from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Compass,
  Building2,
  Stethoscope,
  Sparkles,
  Volume2,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  BarChart3,
  PhoneCall,
  ArrowRight,
  Layers,
  Cpu,
  FileCheck,
} from 'lucide-react';
import { useLanguage } from '@/i18n/context';
import APP_CONFIG from '@/config/app-config';

export default function DemoGuidePage() {
  const { t } = useLanguage();

  const patientSteps = [
    {
      num: '1',
      title: 'Bilingual Public Directory',
      desc: 'Browse facilities in English or Telugu without registration. Search across Hyderabad, Vijayawada, Warangal, and Tirupati.',
      href: '/hospitals',
      btnLabel: 'Explore Directory',
      icon: Building2,
    },
    {
      num: '2',
      title: 'Facility Details & Verification Inspection',
      desc: 'Examine clinical departments, emergency casualty status, Google Maps links, and documented information sources.',
      href: '/hospitals/hosp-001-hyd-charminar',
      btnLabel: 'Inspect Sample Hospital',
      icon: FileCheck,
    },
    {
      num: '3',
      title: 'In-Browser Speech Synthesis (TTS)',
      desc: 'Listen to Telugu and English facility descriptions aloud. Test voice availability and adjust typography scale.',
      href: '/accessibility',
      btnLabel: 'Test Accessibility Voice',
      icon: Volume2,
    },
    {
      num: '4',
      title: 'Grounded AI Navigation Assistant',
      desc: 'Experience intelligent navigation queries with Gemini and Grok waterfall failover, strict citations, and zero clinical hallucination.',
      href: '/assistant',
      btnLabel: 'Ask Navigation Assistant',
      icon: Sparkles,
    },
    {
      num: '5',
      title: 'Anonymous Citizen Feedback',
      desc: 'Submit ratings from 1 to 5 stars without collecting sensitive medical records or personal identity.',
      href: '/feedback',
      btnLabel: 'Submit Feedback',
      icon: MessageSquare,
    },
  ];

  const staffSteps = [
    {
      num: 'A',
      title: 'Administrative Console Overview',
      desc: 'Inspect real-time facility counts, verification coverage, active integrations status, and recent activity.',
      href: '/admin',
      btnLabel: 'Open Staff Dashboard',
      icon: ShieldCheck,
    },
    {
      num: 'B',
      title: 'Data Verification Workflow',
      desc: 'Transition facility records between Verified, Needs Review, and Unverified. Record staff inspector notes and audit events.',
      href: '/admin/verification',
      btnLabel: 'Run Verification Action',
      icon: CheckCircle2,
    },
    {
      num: 'C',
      title: 'Hospital & Department Management',
      desc: 'Perform CRUD operations on facilities and clinical specialties with active/inactive visibility toggles.',
      href: '/admin/hospitals',
      btnLabel: 'Manage Facilities',
      icon: Layers,
    },
    {
      num: 'D',
      title: 'Interactive IVR Telephony Simulation',
      desc: 'Test the on-screen simulated telephone keypad and voice response tree with audio readout.',
      href: '/admin/ivr',
      btnLabel: 'Launch IVR Dialpad',
      icon: PhoneCall,
    },
    {
      num: 'E',
      title: 'SMS Notification Inspector',
      desc: 'Preview and simulate outbound SMS alerts in Mock Mode or configure real Twilio credentials.',
      href: '/admin/notifications',
      btnLabel: 'Test SMS Notification',
      icon: MessageSquare,
    },
    {
      num: 'F',
      title: 'Impact Analytics & Audit Logs',
      desc: 'View search trends, verification coverage, AI failover logs, and administrative audit trails.',
      href: '/admin/analytics',
      btnLabel: 'View Analytics',
      icon: BarChart3,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      {/* Title */}
      <div className="space-y-3 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>SFIC Level 3 Demonstration Guide</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          {t.demo.title}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          {t.demo.subtitle} Follow the structured pathways below to test all patient and administrative features.
        </p>
      </div>

      {/* Patient Experience Tour */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            1
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t.demo.patientTourTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.demo.patientTourDesc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patientSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200">
                      {step.num}
                    </span>
                    <Icon className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>

                <Link
                  href={step.href}
                  className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-800 border border-slate-200 hover:border-emerald-300 font-semibold text-xs transition-colors"
                >
                  <span>{step.btnLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Staff & Administrative Console Tour */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">
            2
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t.demo.staffTourTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.demo.staffTourDesc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-400 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200">
                      {step.num}
                    </span>
                    <Icon className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>

                <Link
                  href={step.href}
                  className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors"
                >
                  <span>{step.btnLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Cpu className="w-5 h-5" />
          <span>Technical Resilience Architecture</span>
        </div>
        <h3 className="text-2xl font-bold tracking-tight">
          Reliable Fallback by Design
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
          {APP_CONFIG.name} is engineered to ensure public healthcare navigation never fails, even during network degradation or missing credentials:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="font-bold text-emerald-400">Database Resilience</span>
            <p className="text-slate-400">
              Dual-mode repository operates seamlessly with live Supabase PostgreSQL or seeded in-memory fallback.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="font-bold text-teal-400">AI Waterfall Failover</span>
            <p className="text-slate-400">
              Gemini rate-limits automatically fall over to Grok, which gracefully falls back to deterministic directory retrieval.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="font-bold text-sky-400">Simulation Guardrails</span>
            <p className="text-slate-400">
              Mock SMS & IVR simulation explicitly log simulated executions without misrepresenting them as real cellular delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

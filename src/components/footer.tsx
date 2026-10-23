'use client';

/**
 * Global Application Footer
 * Features mandatory demo disclaimer, emergency contacts, links to privacy,
 * accessibility controls, and competition metadata.
 */

import React from 'react';
import Link from 'next/link';
import { HeartPulse, PhoneCall, ShieldCheck, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/context';
import APP_CONFIG from '@/config/app-config';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      {/* Emergency Notice Banner */}
      <div className="bg-rose-950/70 border-b border-rose-900/60 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-rose-200 gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Emergency Helpline:</strong> For immediate medical emergencies or ambulance,
              dial <strong>108</strong> (National Ambulance) or <strong>112</strong> (Unified
              Emergency).
            </span>
          </div>
          <span className="text-rose-300/80 text-xs">
            {APP_CONFIG.name} is a navigation tool, not an emergency dispatcher.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">{APP_CONFIG.name}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
              {APP_CONFIG.description}
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Theme 3: Swasth & Samavesh Bharat • South Zone Level 3</span>
            </div>
          </div>

          {/* Quick Directory Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Healthcare Directory
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/hospitals" className="hover:text-white transition-colors">
                  {t.nav.hospitals}
                </Link>
              </li>
              <li>
                <Link href="/departments" className="hover:text-white transition-colors">
                  {t.nav.departments}
                </Link>
              </li>
              <li>
                <Link href="/assistant" className="hover:text-white transition-colors">
                  {t.nav.assistant}
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-white transition-colors">
                  {t.nav.demo}
                </Link>
              </li>
            </ul>
          </div>

          {/* Accessibility & Governance */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Inclusion & Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/accessibility" className="hover:text-white transition-colors">
                  {t.nav.accessibility}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy & Data Handling
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="hover:text-white transition-colors">
                  {t.nav.feedback}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  {t.nav.admin}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Regulatory & Demonstration Disclaimer */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-400 space-y-3">
          <div className="flex items-start gap-2 bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{APP_CONFIG.disclaimer}</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center text-slate-500 gap-2 pt-2">
            <span>© 2026 {APP_CONFIG.name} — Seva First Innovation Challenge Prototype</span>
            <span>Version {APP_CONFIG.version}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

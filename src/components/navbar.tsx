'use client';

/**
 * Top Navigation Bar
 * Features brand identity, primary routes, language switcher (English/Telugu),
 * active audio indicator, and mobile menu toggle.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HeartPulse,
  Languages,
  Menu,
  X,
  Volume2,
  VolumeX,
  Compass,
  Building2,
  Stethoscope,
  Sparkles,
  Accessibility,
  HelpCircle,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { useLanguage } from '@/i18n/context';
import { useAccessibility } from '@/lib/accessibility/context';
import APP_CONFIG from '@/config/app-config';

export function Navbar() {
  const { locale, setLocale, t } = useLanguage();
  const { isSpeaking, stopSpeech } = useAccessibility();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t.nav.home, icon: Compass },
    { href: '/hospitals', label: t.nav.hospitals, icon: Building2 },
    { href: '/departments', label: t.nav.departments, icon: Stethoscope },
    { href: '/assistant', label: t.nav.assistant, icon: Sparkles },
    { href: '/accessibility', label: t.nav.accessibility, icon: Accessibility },
    { href: '/demo', label: t.nav.demo, icon: HelpCircle },
    { href: '/feedback', label: t.nav.feedback, icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Configurable Brand Name */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-emerald-700 hover:text-emerald-800 transition-colors focus:ring-2 focus:ring-emerald-500 rounded-md p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 leading-tight">
                {APP_CONFIG.name}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium tracking-wide uppercase">
                SFIC Navigation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls: Audio Stop, Language Switcher, Staff Portal */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Active Voice Playback Indicator */}
            {isSpeaking && (
              <button
                onClick={stopSpeech}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors animate-pulse"
                title="Stop Audio Speech"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Audio</span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setLocale('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  locale === 'en'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLocale('te')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  locale === 'te'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                తెలుగు
              </button>
            </div>

            {/* Staff / Admin Link */}
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.nav.admin}</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Compact Mobile Language Switcher */}
            <button
              onClick={() => setLocale(locale === 'en' ? 'te' : 'en')}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-md text-slate-700"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-600" />
              <span>{locale === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-800 bg-slate-100 rounded-lg w-full justify-center"
            >
              <Shield className="w-4 h-4 text-slate-600" />
              <span>{t.nav.admin}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

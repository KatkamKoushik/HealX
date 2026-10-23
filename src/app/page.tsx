'use client';

/**
 * Public Landing Page
 * Features configurable brand identity, multilingual hero presentation,
 * interactive search entry point, accessibility TTS hook, and key feature highlights.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Building2,
  Stethoscope,
  Sparkles,
  Volume2,
  CheckCircle2,
  Languages,
  Accessibility,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Clock,
  Phone,
} from 'lucide-react';
import { useLanguage } from '@/i18n/context';
import { useAccessibility } from '@/lib/accessibility/context';
import APP_CONFIG from '@/config/app-config';

export default function HomePage() {
  const { t, locale } = useLanguage();
  const { speakText, isSpeaking, isTtsSupported } = useAccessibility();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/hospitals?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/hospitals');
    }
  };

  const handleReadHero = () => {
    const textToSpeak = `${APP_CONFIG.name}. ${t.home.heroTitle}. ${t.home.heroSubtitle}. ${t.home.heroDescription}`;
    speakText(textToSpeak, locale);
  };

  const popularRegions = ['Hyderabad', 'Vijayawada', 'Warangal', 'Tirupati', 'Visakhapatnam'];

  return (
    <div className="flex flex-col">
      {/* Disclaimer Banner at top of page */}
      <section className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 text-xs sm:text-sm text-amber-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">
              <strong>Demonstration Prototype:</strong> Seeded records represent simulated healthcare facilities for SFIC Level 3 evaluation.
            </span>
          </div>
          <Link
            href="/demo"
            className="hidden sm:inline-flex items-center font-semibold text-emerald-800 hover:underline shrink-0"
          >
            Guided Evaluator Tour →
          </Link>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-teal-50/30 to-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t.home.badge}</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t.home.heroTitle}
            <span className="block text-emerald-600 mt-1">{t.home.heroSubtitle}</span>
          </h1>

          {/* Description */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {t.home.heroDescription}
          </p>

          {/* Accessibility TTS Trigger */}
          {isTtsSupported && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={handleReadHero}
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-xs transition-colors"
                aria-label="Listen to page introduction"
              >
                <Volume2 className={`w-3.5 h-3.5 text-emerald-600 ${isSpeaking ? 'animate-bounce' : ''}`} />
                <span>{isSpeaking ? 'Audio Playing...' : 'Listen to Introduction (TTS)'}</span>
              </button>
            </div>
          )}

          {/* Quick Search Box */}
          <div className="max-w-2xl mx-auto pt-4">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center shadow-lg rounded-2xl bg-white border-2 border-emerald-500/30 p-1.5 focus-within:border-emerald-600 transition-all"
            >
              <div className="pl-3.5 pr-2 text-slate-400">
                <Search className="w-5 h-5 text-emerald-600" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.common.searchPlaceholder}
                className="w-full bg-transparent border-none py-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm sm:text-base flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
              >
                <span>{t.common.search}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Popular Region Quick Filters */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs text-slate-500">
              <span className="font-medium text-slate-600">Quick Regions:</span>
              {popularRegions.map((city) => (
                <Link
                  key={city}
                  href={`/hospitals?city=${city}`}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-emerald-700 transition-colors"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Link
              href="/hospitals"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm sm:text-base shadow-sm transition-all"
            >
              <Building2 className="w-5 h-5" />
              <span>{t.home.ctaHospitals}</span>
            </Link>
            <Link
              href="/departments"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-sm sm:text-base shadow-xs transition-all"
            >
              <Stethoscope className="w-5 h-5 text-emerald-600" />
              <span>{t.home.ctaDepartments}</span>
            </Link>
            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold text-sm sm:text-base shadow-xs transition-all"
            >
              <Sparkles className="w-5 h-5 text-teal-600" />
              <span>{t.home.ctaAssistant}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {t.home.featuresTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {t.home.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Multilingual */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Languages className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">{t.home.featureMultilingualTitle}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.home.featureMultilingualDesc}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 text-xs font-semibold text-emerald-700">
              English & తెలుగు Native
            </div>
          </div>

          {/* Card 2: Voice & Accessibility */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Accessibility className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">{t.home.featureAccessibilityTitle}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.home.featureAccessibilityDesc}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 text-xs font-semibold text-teal-700">
              TTS Voice & Typography Scale
            </div>
          </div>

          {/* Card 3: AI Waterfall */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">{t.home.featureAiTitle}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.home.featureAiDesc}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 text-xs font-semibold text-sky-700">
              Gemini → Grok → Offline Fallback
            </div>
          </div>

          {/* Card 4: Auditable Verification */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">{t.home.featureVerificationTitle}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.home.featureVerificationDesc}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 text-xs font-semibold text-indigo-700">
              Field Visits & Source Citations
            </div>
          </div>
        </div>
      </section>

      {/* Guided Demonstration Callout */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700 text-emerald-300 text-xs font-semibold">
              <span>SFIC Jury Evaluation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to explore the Level 3 demonstration?
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Experience the patient journey from search to Telugu speech synthesis, then inspect the staff verification and telephony audit trail.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/demo"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-md transition-colors"
            >
              Start Guided Tour
            </Link>
            <Link
              href="/admin"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 transition-colors"
            >
              Staff Console
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

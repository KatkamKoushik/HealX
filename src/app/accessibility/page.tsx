'use client';

/**
 * Accessibility Center Page
 * Exposes live user controls for typography scaling, contrast switching,
 * speech synthesis voice diagnostic, and keyboard navigation documentation.
 */

import React, { useState } from 'react';
import {
  Accessibility,
  Volume2,
  VolumeX,
  Type,
  Sun,
  Eye,
  Keyboard,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '@/i18n/context';
import { useAccessibility, FontSizeOption, ContrastOption } from '@/lib/accessibility/context';

export default function AccessibilityPage() {
  const { t, locale } = useLanguage();
  const {
    fontSize,
    setFontSize,
    contrast,
    setContrast,
    speakText,
    stopSpeech,
    isSpeaking,
    isTtsSupported,
    hasTeluguVoice,
  } = useAccessibility();

  const [testStatus, setTestStatus] = useState<string | null>(null);

  const handleTestTts = () => {
    const sample =
      locale === 'te'
        ? 'ఇది సేవా ఫస్ట్ ఇన్నోవేషన్ ఛాలెంజ్ వాయిస్ అసిస్టెన్స్ పరీక్ష. ఆసుపత్రులు మరియు సేవల వివరాలు స్పష్టంగా వినిపిస్తాయి.'
        : 'This is an accessibility voice output test for the healthcare navigation platform. Hospital details and directions are read aloud for inclusive access.';

    setTestStatus('Speaking sample sentence...');
    speakText(sample, locale);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <Accessibility className="w-3.5 h-3.5" />
          <span>Universal Design & Inclusion</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.accessibility.title}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          {t.accessibility.subtitle}
        </p>
      </div>

      {/* Control 1: Text-to-Speech Engine */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t.accessibility.ttsTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-600">{t.accessibility.ttsDesc}</p>
          </div>
        </div>

        {/* Diagnostic info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <span className="font-medium text-slate-700">Browser Speech API:</span>
            {isTtsSupported ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Supported</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Not Supported</span>
              </span>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <span className="font-medium text-slate-700">Telugu Speech Engine:</span>
            {hasTeluguVoice ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Installed</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Fallback Mode</span>
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 italic">
          {t.accessibility.ttsNotice}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleTestTts}
            disabled={!isTtsSupported}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>{t.accessibility.ttsTestBtn}</span>
          </button>

          {isSpeaking && (
            <button
              onClick={stopSpeech}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs sm:text-sm transition-colors"
            >
              <VolumeX className="w-4 h-4" />
              <span>{t.accessibility.ttsStopBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Control 2: Font Size Adjustment */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t.accessibility.fontSizeTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Increase typography scaling for easier reading on mobile and desktop displays.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          {(['normal', 'large', 'xlarge'] as FontSizeOption[]).map((size) => {
            const isSelected = fontSize === size;
            const labels = {
              normal: t.accessibility.fontSizeNormal,
              large: t.accessibility.fontSizeLarge,
              xlarge: t.accessibility.fontSizeXLarge,
            };

            return (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all text-center ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {labels[size]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Control 3: Visual Contrast */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t.accessibility.contrastTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Toggle between calm healthcare styling and high-contrast outlines for visual impairments.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {(['normal', 'high'] as ContrastOption[]).map((mode) => {
            const isSelected = contrast === mode;
            const labels = {
              normal: t.accessibility.contrastNormal,
              high: t.accessibility.contrastHigh,
            };

            return (
              <button
                key={mode}
                onClick={() => setContrast(mode)}
                className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all text-center ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {labels[mode]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Control 4: Keyboard Shortcuts & Screen Readers */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t.accessibility.keyboardTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-600">{t.accessibility.keyboardDesc}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="font-semibold text-slate-800">Tab / Shift+Tab</span>
            <span className="text-slate-600">Navigate interactive elements</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="font-semibold text-slate-800">Enter / Space</span>
            <span className="text-slate-600">Activate link or button</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="font-semibold text-slate-800">Escape</span>
            <span className="text-slate-600">Dismiss dialogs & mobile drawer</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="font-semibold text-slate-800">Alt + L</span>
            <span className="text-slate-600">Toggle English / Telugu</span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * Citizen & Patient Feedback Form
 * Collects non-sensitive user satisfaction ratings and suggestions
 * with privacy preservation and multilingual validation.
 */

import React, { useState } from 'react';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useLanguage } from '@/i18n/context';

export default function FeedbackPage() {
  const { t, locale } = useLanguage();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<'general' | 'navigation' | 'data_accuracy' | 'accessibility' | 'language'>('general');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          rating,
          message: message.trim() || null,
          preferred_language: locale,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error submitting response');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-16 space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Continuous Improvement</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.feedback.title}
        </h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto">
          {t.feedback.subtitle}
        </p>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Privacy Preserved:</strong> We do not collect names, phone numbers, or health information. All responses are completely anonymous.
        </span>
      </div>

      {submitted ? (
        <div className="p-8 rounded-3xl bg-white border border-emerald-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {t.feedback.successMessage}
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Your feedback helps us refine directory accuracy and enhance voice accessibility for citizens across South India.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setMessage('');
              setRating(5);
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
          >
            Submit Another Response
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6"
        >
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Rating Stars */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">
              {t.feedback.ratingLabel}
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      (hoverRating !== null ? star <= hoverRating : star <= rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-slate-700 ml-2">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          {/* Feedback Category */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">
              {t.feedback.categoryLabel}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="general">{t.feedback.categoryGeneral}</option>
              <option value="navigation">{t.feedback.categoryNavigation}</option>
              <option value="data_accuracy">{t.feedback.categoryAccuracy}</option>
              <option value="accessibility">{t.feedback.categoryAccessibility}</option>
            </select>
          </div>

          {/* Message Textarea */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">
              {t.feedback.messageLabel}
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.feedback.messagePlaceholder}
              maxLength={800}
              className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="text-right text-[11px] text-slate-400">
              {message.length} / 800 characters
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'Submitting...' : t.common.submit}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

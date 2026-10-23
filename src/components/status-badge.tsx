'use client';

/**
 * Verification & Status Badges
 * Provides consistent, high-contrast, accessible status indicators for healthcare entities.
 */

import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, Ban } from 'lucide-react';
import { VerificationStatus } from '@/types/database';
import { useLanguage } from '@/i18n/context';

interface StatusBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { t } = useLanguage();

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm';

  switch (status) {
    case 'verified':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          <span>{t.common.verified}</span>
        </span>
      );
    case 'needs_review':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
          <span>{t.common.needsReview}</span>
        </span>
      );
    case 'unverified':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 ${sizeClasses}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>{t.common.unverified}</span>
        </span>
      );
    case 'inactive':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 ${sizeClasses}`}
        >
          <Ban className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
          <span>{t.common.inactive}</span>
        </span>
      );
    default:
      return null;
  }
}

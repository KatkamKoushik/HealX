'use client';

/**
 * Hospital Detail Page
 * Detailed facility overview, verified clinical departments, active services,
 * auditable verification history, and Google Maps navigation link.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Mail,
  Globe,
  Navigation,
  Volume2,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
  Info,
  Calendar,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { Hospital, Department, Service } from '@/types/database';
import { StatusBadge } from '@/components/status-badge';
import { useLanguage } from '@/i18n/context';
import { useAccessibility } from '@/lib/accessibility/context';
import APP_CONFIG from '@/config/app-config';

export default function HospitalDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { t, locale } = useLanguage();
  const { speakText, isSpeaking } = useAccessibility();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHospital() {
      try {
        setLoading(true);
        const res = await fetch(`/api/hospitals/${id}`);
        if (!res.ok) throw new Error('Hospital record not found');
        const data = await res.json();
        setHospital(data.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error loading details');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadHospital();
    }
  }, [id]);

  const getDirectionsUrl = (h: Hospital) => {
    if (h.latitude && h.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`;
    }
    const query = encodeURIComponent(`${h.name}, ${h.address}, ${h.city}, ${h.state}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const handleSpeakOverview = () => {
    if (!hospital) return;
    const text =
      locale === 'te'
        ? `${hospital.name}. చిరునామా: ${hospital.address}, ${hospital.city}. పనివేళలు: ${
            hospital.operating_hours || '24 గంటలు'
          }. అత్యవసర విభాగం: ${hospital.emergency_information || 'అందుబాటులో ఉంది'}. సమాచార స్థితి: ${
            hospital.verification_status === 'verified'
              ? 'ధృవీకరించబడిన రికార్డు'
              : 'నమూనా ప్రదర్శన రికార్డు'
          }.`
        : `${hospital.name}. Located at ${hospital.address}, ${hospital.city}. Operating hours: ${
            hospital.operating_hours || 'Standard hours'
          }. Emergency service: ${hospital.emergency_information || 'Available'}. Status: ${
            hospital.verification_status
          }.`;

    speakText(text, locale);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-28"></div>
        <div className="h-8 bg-slate-200 rounded w-2/3"></div>
        <div className="h-40 bg-white border border-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">{t.common.notFound}</h2>
        <p className="text-slate-600 text-sm">
          The requested healthcare facility does not exist or has been deactivated.
        </p>
        <Link
          href="/hospitals"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hospitals</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <Link
        href="/hospitals"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Hospitals Directory</span>
      </Link>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                {hospital.hospital_type}
              </span>
              <StatusBadge status={hospital.verification_status} size="md" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {hospital.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              {hospital.description}
            </p>
          </div>

          {/* Audio TTS button */}
          <button
            onClick={handleSpeakOverview}
            className="self-start inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
            title="Read summary aloud"
          >
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>{isSpeaking ? 'Playing Audio...' : 'Listen Aloud (TTS)'}</span>
          </button>
        </div>

        {/* Action Buttons: Directions and Phone Call */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <a
            href={getDirectionsUrl(hospital)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>{t.common.directions} (Google Maps)</span>
          </a>

          {hospital.phone && (
            <a
              href={`tel:${hospital.phone}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call: {hospital.phone}</span>
            </a>
          )}
        </div>

        {/* Essential Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.common.address}
            </span>
            <div className="flex items-start gap-2 text-slate-800">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {hospital.address}, {hospital.locality}, {hospital.city}, {hospital.state} -{' '}
                {hospital.postal_code}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.common.hours}
            </span>
            <div className="flex items-start gap-2 text-slate-800">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{hospital.operating_hours || 'Standard public hours'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Emergency Wing
            </span>
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-xs font-medium text-rose-800">
              {hospital.emergency_information || 'Standard casualty services'}
            </div>
          </div>
        </div>
      </div>

      {/* Departments & Services Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Clinical Departments & Services
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {hospital.departments?.length || 0} Departments Active
          </span>
        </div>

        {(!hospital.departments || hospital.departments.length === 0) ? (
          <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-slate-500 text-sm">
            No specific departments registered for this facility.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospital.departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-slate-900">{dept.name}</h3>
                  <StatusBadge status={dept.verification_status} size="sm" />
                </div>
                <p className="text-xs sm:text-sm text-slate-600">{dept.description}</p>

                <div className="pt-2 text-xs text-slate-500 space-y-1 border-t border-slate-100">
                  {dept.operating_hours && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dept.operating_hours}</span>
                    </div>
                  )}
                  {dept.contact_information && (
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dept.contact_information}</span>
                    </div>
                  )}
                </div>

                {/* Sub-services */}
                {dept.services && dept.services.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">
                      Services Provided:
                    </span>
                    <ul className="space-y-1">
                      {dept.services.map((srv) => (
                        <li key={srv.id} className="text-xs text-slate-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-medium">{srv.name}</span>
                          <span className="text-slate-400">({srv.service_category})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information Verification & Audit Source Section */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <h2 className="text-lg font-bold text-slate-900">Information Verification Audit</h2>
        </div>

        <div className="text-xs sm:text-sm text-slate-600 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200">
            <div>
              <span className="font-semibold text-slate-800">Status Tier: </span>
              <span className="capitalize font-medium text-emerald-700">
                {hospital.verification_status}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {t.common.lastVerified}: {new Date(hospital.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {hospital.information_sources && hospital.information_sources.length > 0 ? (
            <div className="space-y-2 pt-2">
              <span className="font-semibold text-slate-700 text-xs uppercase tracking-wide">
                Documented Sources on Record:
              </span>
              {hospital.information_sources.map((src) => (
                <div key={src.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-800 text-xs">
                    <span>{src.source_name}</span>
                    <span className="text-emerald-700 uppercase font-mono text-[10px] bg-emerald-50 px-2 py-0.5 rounded">
                      {src.source_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{src.notes}</p>
                  <div className="text-[11px] text-slate-400 font-mono pt-1">
                    Ref: {src.source_reference} • Verified: {new Date(src.checked_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
              <strong>Sample Demonstration Record:</strong> This facility is seeded for prototype evaluation and has not been verified against independent hospital registry sources.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

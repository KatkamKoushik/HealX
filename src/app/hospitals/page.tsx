'use client';

/**
 * Hospital Directory Page
 * Search, filter, inspect verification statuses, get Google Maps directions,
 * and listen to hospital details via text-to-speech.
 */

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Building2,
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  Volume2,
  Filter,
  X,
  AlertCircle,
  ShieldCheck,
  Stethoscope,
  Navigation,
} from 'lucide-react';
import { Hospital, HospitalType, VerificationStatus } from '@/types/database';
import { StatusBadge } from '@/components/status-badge';
import { useLanguage } from '@/i18n/context';
import { useAccessibility } from '@/lib/accessibility/context';
import APP_CONFIG from '@/config/app-config';

function HospitalsDirectoryContent() {
  const { t, locale } = useLanguage();
  const { speakText, isSpeaking } = useAccessibility();
  const searchParams = useSearchParams();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState<string>(searchParams.get('type') || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'all');
  const [selectedCity, setSelectedCity] = useState<string>(searchParams.get('city') || 'all');

  useEffect(() => {
    async function fetchHospitals() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (search) queryParams.set('search', search);
        if (selectedType !== 'all') queryParams.set('type', selectedType);
        if (selectedStatus !== 'all') queryParams.set('status', selectedStatus);
        if (selectedCity !== 'all') queryParams.set('city', selectedCity);

        const res = await fetch(`/api/hospitals?${queryParams.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch hospitals');
        const data = await res.json();
        setHospitals(data.data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error fetching facilities');
      } finally {
        setLoading(false);
      }
    }

    fetchHospitals();
  }, [search, selectedType, selectedStatus, selectedCity]);

  const clearAllFilters = () => {
    setSearch('');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedCity('all');
  };

  const handleSpeakHospital = (h: Hospital) => {
    const text =
      locale === 'te'
        ? `${h.name}. ప్రాంతం: ${h.locality}, ${h.city}. ఫోన్: ${h.phone || 'లభ్యం కాలేదు'}. పనివేళలు: ${
            h.operating_hours || '24 గంటలు'
          }. అత్యవసర విభాగం: ${h.emergency_information || 'అందుబాటులో ఉంది'}. స్థితి: ${
            h.verification_status === 'verified' ? 'ధృవీకరించబడింది' : 'నమూనా రికార్డు'
          }.`
        : `${h.name}. Located in ${h.locality}, ${h.city}. Phone: ${h.phone || 'Not available'}. Operating hours: ${
            h.operating_hours || 'Standard hours'
          }. Emergency service: ${h.emergency_information || 'Available'}. Verification status: ${
            h.verification_status
          }.`;

    speakText(text, locale);
  };

  // Google Maps Directions Link Generator
  const getDirectionsUrl = (h: Hospital) => {
    if (h.latitude && h.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`;
    }
    const query = encodeURIComponent(`${h.name}, ${h.address}, ${h.city}, ${h.state}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const hospitalTypes: HospitalType[] = [
    'Community Health Centre',
    'Teaching Hospital',
    'Area Hospital',
    'Specialty Centre',
    'Primary Health Centre',
    'General Hospital',
  ];

  const cities = ['Hyderabad', 'Vijayawada', 'Warangal', 'Tirupati', 'Visakhapatnam', 'Khammam'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <Building2 className="w-3.5 h-3.5" />
          <span>Verified Healthcare Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.hospitals.title}
        </h1>
        <p className="text-slate-600 max-w-3xl text-sm sm:text-base">
          {t.hospitals.subtitle}
        </p>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.common.searchPlaceholder}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Filter by Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.hospitals.filterByType}
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">{t.hospitals.allTypes}</option>
              {hospitalTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.hospitals.filterByStatus}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">{t.common.all}</option>
              <option value="verified">{t.common.verified}</option>
              <option value="needs_review">{t.common.needsReview}</option>
              <option value="unverified">{t.common.unverified}</option>
            </select>
          </div>

          {/* Filter by City */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.hospitals.filterByCity}
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">{t.hospitals.allCities}</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filters tag & Reset */}
        {(search || selectedType !== 'all' || selectedStatus !== 'all' || selectedCity !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Filtered results active
            </span>
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.common.clearFilters}</span>
            </button>
          </div>
        )}
      </div>

      {/* Facilities Count Header */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <p>
          <strong className="text-slate-900 font-bold">{hospitals.length}</strong> {t.hospitals.hospitalCount}
        </p>
        <span className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
          {t.common.sampleDataNotice}
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-4">
              <div className="h-5 bg-slate-200 rounded-md w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded-md w-1/2"></div>
              <div className="space-y-2 pt-2">
                <div className="h-3.5 bg-slate-100 rounded-md w-full"></div>
                <div className="h-3.5 bg-slate-100 rounded-md w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h3 className="font-bold text-slate-900">Unable to load hospital records</h3>
          <p className="text-sm text-slate-600">{error}</p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && hospitals.length === 0 && (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-4">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">{t.common.noResults}</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try adjusting your search query, selecting "All Facility Types", or resetting regional filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
          >
            {t.common.clearFilters}
          </button>
        </div>
      )}

      {/* Hospital Cards Grid */}
      {!loading && !error && hospitals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {/* Header: Type and Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    {hospital.hospital_type}
                  </span>
                  <StatusBadge status={hospital.verification_status} size="sm" />
                </div>

                {/* Facility Name */}
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  <Link
                    href={`/hospitals/${hospital.id}`}
                    className="hover:text-emerald-700 transition-colors"
                  >
                    {hospital.name}
                  </Link>
                </h2>

                {/* Location and Contacts */}
                <div className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      {hospital.locality}, {hospital.city}, {hospital.state} ({hospital.postal_code})
                    </span>
                  </div>

                  {hospital.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <a
                        href={`tel:${hospital.phone}`}
                        className="text-emerald-700 hover:underline font-medium"
                      >
                        {hospital.phone}
                      </a>
                    </div>
                  )}

                  {hospital.operating_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{hospital.operating_hours}</span>
                    </div>
                  )}
                </div>

                {/* Emergency Tag */}
                {hospital.emergency_information && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-xs text-rose-800 font-medium">
                    {hospital.emergency_information}
                  </div>
                )}

                {/* Departments Preview */}
                {hospital.departments && hospital.departments.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-xs text-slate-500 font-medium">
                      {hospital.departments.length} {t.hospitals.departmentsCount}:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {hospital.departments.slice(0, 3).map((dept) => (
                        <span
                          key={dept.id}
                          className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                        >
                          {dept.name}
                        </span>
                      ))}
                      {hospital.departments.length > 3 && (
                        <span className="text-[11px] text-slate-400 self-center">
                          +{hospital.departments.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Text-to-speech button */}
                  <button
                    type="button"
                    onClick={() => handleSpeakHospital(hospital)}
                    className="p-2 rounded-lg text-slate-600 hover:bg-white hover:text-emerald-700 border border-transparent hover:border-slate-200 transition-colors"
                    title="Listen aloud (TTS)"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {/* Directions Link (Google Maps) */}
                  <a
                    href={getDirectionsUrl(hospital)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t.common.directions}</span>
                  </a>
                </div>

                {/* View Details Link */}
                <Link
                  href={`/hospitals/${hospital.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  <span>{t.common.viewDetails}</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HospitalsDirectoryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64" />
          <div className="h-20 bg-slate-100 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-slate-100 rounded-2xl" />
            <div className="h-64 bg-slate-100 rounded-2xl" />
            <div className="h-64 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      }
    >
      <HospitalsDirectoryContent />
    </Suspense>
  );
}

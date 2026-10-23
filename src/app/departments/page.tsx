'use client';

/**
 * Medical Departments & Specialties Directory
 * Browse clinical services, outpatient schedules, and facilities offering each specialty.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Search,
  Building2,
  Clock,
  Phone,
  AlertTriangle,
  Heart,
  Baby,
  Eye,
  Bone,
  Pill,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Department } from '@/types/database';
import { StatusBadge } from '@/components/status-badge';
import { useLanguage } from '@/i18n/context';

export default function DepartmentsPage() {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  const specialtyCategories = [
    { id: 'all', label: 'All Specialties', icon: Stethoscope },
    { id: 'General Medicine', label: 'General Medicine', icon: Pill },
    { id: 'Pediatrics', label: 'Pediatrics & Child Care', icon: Baby },
    { id: 'Cardiology', label: 'Cardiology & Heart', icon: Heart },
    { id: 'Orthopedics', label: 'Orthopedics & Bones', icon: Bone },
    { id: 'Ophthalmology', label: 'Ophthalmology & Eye', icon: Eye },
    { id: 'Emergency', label: 'Emergency Services', icon: AlertTriangle },
  ];

  useEffect(() => {
    async function loadDepartments() {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (search) query.set('search', search);

        const res = await fetch(`/api/departments?${query.toString()}`);
        if (!res.ok) throw new Error('Failed to load departments');
        const data = await res.json();
        setDepartments(data.data || []);
      } catch {
        // error handling
      } finally {
        setLoading(false);
      }
    }

    loadDepartments();
  }, [search]);

  const filteredDepartments = departments.filter((dept) => {
    if (selectedSpecialty === 'all') return true;
    return (
      dept.name.toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
      dept.description.toLowerCase().includes(selectedSpecialty.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Clinical Specialty Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.departments.title}
        </h1>
        <p className="text-slate-600 max-w-3xl text-sm sm:text-base">
          {t.departments.subtitle}
        </p>
      </div>

      {/* Demonstration Categories Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Demonstration Categories:</strong> Clinical departments and available services shown below are demonstration categories for the SFIC prototype evaluation, not a medical guarantee of real-time ward availability at any facility.
        </div>
      </div>

      {/* Specialty Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {specialtyCategories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedSpecialty === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedSpecialty(cat.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by specialty or condition..."
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 h-44"></div>
          ))}
        </div>
      )}

      {/* Departments Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                    Clinical Department
                  </span>
                  <StatusBadge status={dept.verification_status} size="sm" />
                </div>

                <h3 className="font-bold text-lg text-slate-900">{dept.name}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {dept.description}
                </p>

                {/* Operating Hours & Contact */}
                <div className="pt-2 text-xs text-slate-500 space-y-1.5 border-t border-slate-100">
                  {dept.operating_hours && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dept.operating_hours}</span>
                    </div>
                  )}
                  {dept.contact_information && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dept.contact_information}</span>
                    </div>
                  )}
                </div>

                {/* Associated Services */}
                {dept.services && dept.services.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">
                      Services:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {dept.services.map((srv) => (
                        <span
                          key={srv.id}
                          className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                        >
                          {srv.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Linked Facility Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium truncate max-w-[200px]">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{dept.hospital_name}</span>
                </div>
                <Link
                  href={`/hospitals/${dept.hospital_id}`}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline shrink-0"
                >
                  View Facility →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

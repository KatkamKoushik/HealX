'use client';

/**
 * Healthcare Information Verification Workflow Console
 * Staff workflow to inspect source references, transition reliability tiers,
 * record auditor notes, and update public confidence badges.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Ban,
  ShieldCheck,
  Building2,
  Search,
  Filter,
  FileCheck,
  Info,
  Calendar,
  X,
} from 'lucide-react';
import { Hospital, VerificationStatus } from '@/types/database';
import { StatusBadge } from '@/components/status-badge';

export default function VerificationConsolePage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Selected hospital for verification action
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [newStatus, setNewStatus] = useState<VerificationStatus>('verified');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('Staff Evaluator (SFIC)');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/hospitals?activeOnly=false');
      const data = await res.json();
      setHospitals(data.data || []);
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleOpenVerifyModal = (h: Hospital) => {
    setSelectedHospital(h);
    setNewStatus(h.verification_status === 'verified' ? 'needs_review' : 'verified');
    setVerificationNotes(
      h.verification_status === 'verified'
        ? 'Scheduled periodic review required due to seasonal OPD timing updates.'
        : 'Confirmed facility operating hours, telephone desk, and emergency trauma triage.'
    );
    setActionSuccess(null);
  };

  const handleExecuteVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospital) return;

    setActionLoading(true);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/hospitals/${selectedHospital.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: verificationNotes.trim(),
          verifiedBy: verifiedBy.trim(),
        }),
      });

      if (!res.ok) throw new Error('Verification failed');

      setActionSuccess(`Successfully transitioned ${selectedHospital.name} to ${newStatus}.`);
      await fetchHospitals();

      setTimeout(() => {
        setSelectedHospital(null);
        setActionSuccess(null);
      }, 1500);
    } catch {
      // error handling
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = hospitals.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || h.verification_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Auditable Verification Workflow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Healthcare Information Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Ensure public reliability by reviewing facility sources and transitioning confidence tiers.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search facility name or city..."
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
          >
            <option value="all">All Verification Tiers</option>
            <option value="needs_review">Needs Review</option>
            <option value="unverified">Unverified</option>
            <option value="verified">Verified</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Facilities Verification Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Facility Name & Location</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Documented Sources</th>
                <th className="py-3 px-4">Last Verified</th>
                <th className="py-3 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((hospital) => (
                <tr key={hospital.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{hospital.name}</div>
                    <div className="text-xs text-slate-500">
                      {hospital.locality}, {hospital.city} ({hospital.hospital_type})
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={hospital.verification_status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {hospital.information_sources && hospital.information_sources.length > 0 ? (
                      <span className="font-medium text-emerald-700">
                        {hospital.information_sources[0].source_name} ({hospital.information_sources[0].source_type})
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">No source documented</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                    {new Date(hospital.updated_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleOpenVerifyModal(hospital)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs transition-colors"
                    >
                      Update Verification Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Modal Dialog */}
      {selectedHospital && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                  Staff Verification Review
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {selectedHospital.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedHospital(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{actionSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleExecuteVerification} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    New Verification Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as VerificationStatus)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium"
                  >
                    <option value="verified">Verified (Confirmed with documented source)</option>
                    <option value="needs_review">Needs Review (Information outdated or uncertain)</option>
                    <option value="unverified">Unverified (Self-reported / unconfirmed)</option>
                    <option value="inactive">Inactive (Facility closed or suspended)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Auditor / Staff Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={verifiedBy}
                    onChange={(e) => setVerifiedBy(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Verification Notes & Evidence Reference
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Enter phone confirmation, field visit notes, or source verification rationale..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                  <p className="text-[11px] text-slate-500">
                    * Recorded immutably in system audit logs and visible on public facility details.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedHospital(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors"
                  >
                    {actionLoading ? 'Recording...' : 'Commit Status Update'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

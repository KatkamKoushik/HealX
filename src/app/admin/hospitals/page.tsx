'use client';

/**
 * Hospital Directory Administration
 * Add, edit, activate/deactivate facilities, and attach verification sources.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Eye,
  Navigation,
  FileCheck,
  X,
  AlertCircle,
  Save,
} from 'lucide-react';
import { Hospital, HospitalType, VerificationStatus } from '@/types/database';
import { StatusBadge } from '@/components/status-badge';

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<HospitalType>('Community Health Centre');
  const [formCity, setFormCity] = useState('Hyderabad');
  const [formLocality, setFormLocality] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPin, setFormPin] = useState('500001');
  const [formPhone, setFormPhone] = useState('+91-40-555-0100');
  const [formHours, setFormHours] = useState('24 Hours');
  const [formEmergency, setFormEmergency] = useState('Casualty ward available 24/7');
  const [formDescription, setFormDescription] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  const handleOpenCreate = () => {
    setEditingHospital(null);
    setFormName('');
    setFormType('Community Health Centre');
    setFormCity('Hyderabad');
    setFormLocality('');
    setFormAddress('');
    setFormPin('500001');
    setFormPhone('+91-40-555-0100');
    setFormHours('24 Hours');
    setFormEmergency('Casualty unit open 24/7');
    setFormDescription('Public community healthcare facility providing outpatient & emergency care.');
    setFormActive(true);
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (h: Hospital) => {
    setEditingHospital(h);
    setFormName(h.name);
    setFormType(h.hospital_type);
    setFormCity(h.city);
    setFormLocality(h.locality);
    setFormAddress(h.address);
    setFormPin(h.postal_code);
    setFormPhone(h.phone || '');
    setFormHours(h.operating_hours || '');
    setFormEmergency(h.emergency_information || '');
    setFormDescription(h.description);
    setFormActive(h.is_active);
    setFormError(null);
    setShowModal(true);
  };

  const handleToggleActive = async (h: Hospital) => {
    try {
      await fetch(`/api/hospitals/${h.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !h.is_active }),
      });
      await fetchHospitals();
    } catch {
      // error handling
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAddress.trim()) {
      setFormError('Facility name and address are required.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      name: formName.trim(),
      slug: formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      hospital_type: formType,
      city: formCity.trim(),
      locality: formLocality.trim(),
      address: formAddress.trim(),
      postal_code: formPin.trim(),
      phone: formPhone.trim() || null,
      operating_hours: formHours.trim() || null,
      emergency_information: formEmergency.trim() || null,
      description: formDescription.trim(),
      is_active: formActive,
      state: 'Telangana',
      verification_status: editingHospital ? editingHospital.verification_status : 'unverified',
    };

    try {
      if (editingHospital) {
        await fetch(`/api/hospitals/${editingHospital.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/hospitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setShowModal(false);
      await fetchHospitals();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Save operation failed');
    } finally {
      setSaving(false);
    }
  };

  const filtered = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase()) ||
      h.locality.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Master Facility Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Hospitals & Health Facilities
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Create new healthcare records, update addresses, and control public visibility.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Hospital</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search facility name, locality, or city..."
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          {filtered.length} Facilities Recorded
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Hospital Name</th>
                <th className="py-3 px-4">City / Locality</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((hospital) => (
                <tr key={hospital.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <Link
                      href={`/hospitals/${hospital.id}`}
                      target="_blank"
                      className="hover:text-emerald-700 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{hospital.name}</span>
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {hospital.locality}, {hospital.city}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {hospital.hospital_type}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={hospital.verification_status} size="sm" />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(hospital)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        hospital.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {hospital.is_active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleOpenEdit(hospital)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                      title="Edit details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form for Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase">
                  {editingHospital ? 'Edit Facility Record' : 'Register New Healthcare Facility'}
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingHospital ? editingHospital.name : 'New Facility Profile'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-slate-700">Facility Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Kakatiya Community Health Centre"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Facility Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as HospitalType)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Community Health Centre">Community Health Centre</option>
                    <option value="Teaching Hospital">Teaching Hospital</option>
                    <option value="Area Hospital">Area Hospital</option>
                    <option value="Specialty Centre">Specialty Centre</option>
                    <option value="Primary Health Centre">Primary Health Centre</option>
                    <option value="General Hospital">General Hospital</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">City / District</label>
                  <input
                    type="text"
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Locality / Landmark</label>
                  <input
                    type="text"
                    required
                    value={formLocality}
                    onChange={(e) => setFormLocality(e.target.value)}
                    placeholder="e.g. Moghalpura, Fort Road"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Postal Code (PIN)</label>
                  <input
                    type="text"
                    required
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-slate-700">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Telephone / Helpline</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Operating Hours</label>
                  <input
                    type="text"
                    value={formHours}
                    onChange={(e) => setFormHours(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-slate-700">Emergency & Casualty Information</label>
                  <input
                    type="text"
                    value={formEmergency}
                    onChange={(e) => setFormEmergency(e.target.value)}
                    placeholder="e.g. Level 2 Emergency unit 24/7"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-slate-700">Description</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <label htmlFor="isActive" className="font-semibold text-slate-800">
                    Visible in Public Directory (Active)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Hospital Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

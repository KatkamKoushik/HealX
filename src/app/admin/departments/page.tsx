'use client';

/**
 * Department & Clinical Service Management
 * Create, edit, and link departments to hospitals.
 */

import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Plus,
  Search,
  Building2,
  Clock,
  Phone,
  Edit2,
  CheckCircle2,
  X,
  Save,
} from 'lucide-react';
import { Department, Hospital } from '@/types/database';
import { StatusBadge } from '@/components/status-badge';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formHospitalId, setFormHospitalId] = useState('');
  const [formHours, setFormHours] = useState('Mon-Sat: 9:00 AM - 2:00 PM');
  const [formContact, setFormContact] = useState('Room 101, OPD Block');
  const [formDesc, setFormDesc] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resDepts, resHosps] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/hospitals?activeOnly=false'),
      ]);
      const dataDepts = await resDepts.json();
      const dataHosps = await resHosps.json();
      setDepartments(dataDepts.data || []);
      setHospitals(dataHosps.data || []);
      if (dataHosps.data?.length > 0 && !formHospitalId) {
        setFormHospitalId(dataHosps.data[0].id);
      }
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setFormName('');
    if (hospitals.length > 0) setFormHospitalId(hospitals[0].id);
    setFormHours('Mon-Sat: 9:00 AM - 2:00 PM');
    setFormContact('Room 101, OPD Block');
    setFormDesc('Clinical consultations, outpatient diagnosis, and preventive follow-ups.');
    setFormActive(true);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formHospitalId) return;

    setSaving(true);
    try {
      await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospital_id: formHospitalId,
          name: formName.trim(),
          description: formDesc.trim(),
          contact_information: formContact.trim(),
          operating_hours: formHours.trim(),
          is_active: formActive,
          verification_status: 'verified',
        }),
      });

      setShowModal(false);
      await fetchData();
    } catch {
      // error handling
    } finally {
      setSaving(false);
    }
  };

  const filtered = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.hospital_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Specialty & Service Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Clinical Departments & Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Configure clinical offerings, OPD timings, and link departments to designated hospitals.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Department</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search department or hospital..."
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          {filtered.length} Departments Registered
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Department Name</th>
                <th className="py-3 px-4">Associated Hospital</th>
                <th className="py-3 px-4">Hours & Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{dept.name}</div>
                    <div className="text-xs text-slate-500 max-w-sm truncate">
                      {dept.description}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate max-w-xs">{dept.hospital_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">
                    <div>{dept.operating_hours || 'Standard Hours'}</div>
                    <div className="text-slate-400">{dept.contact_information}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={dept.verification_status} size="sm" />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        dept.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {dept.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase">
                  New Department Form
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Register Clinical Department
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Department Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Pediatrics & Neonatology"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Assign to Hospital *</label>
                <select
                  value={formHospitalId}
                  onChange={(e) => setFormHospitalId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.city})
                    </option>
                  ))}
                </select>
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

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Contact / Location Note</label>
                <input
                  type="text"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Department Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
                  <span>{saving ? 'Saving...' : 'Create Department'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

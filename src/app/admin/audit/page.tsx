'use client';

/**
 * System Audit Log Viewer
 * Immutable security and administrative mutation records.
 * Contains no secrets, tokens, or sensitive medical queries.
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  ShieldCheck,
  Clock,
  User,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { AuditLog } from '@/types/database';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/audit');
      const data = await res.json();
      setLogs(data.data || []);
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor_user_id.toLowerCase().includes(search.toLowerCase()) ||
      l.entity_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrative Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            System & Mutation Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Immutable tracking of verification actions, directory updates, and administrative events.
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Trail</span>
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
            placeholder="Search action, actor, or entity..."
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          {filtered.length} Audit Events Logged
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Actor ID</th>
                <th className="py-3 px-4">Entity Type / ID</th>
                <th className="py-3 px-4">Safe Metadata</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-emerald-800 font-sans">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {log.actor_user_id}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="uppercase text-[11px] bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700 mr-1.5">
                      {log.entity_type}
                    </span>
                    <span className="text-[11px] text-slate-400">{log.entity_id}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {log.safe_metadata ? JSON.stringify(log.safe_metadata) : '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

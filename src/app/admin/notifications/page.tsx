'use client';

/**
 * SMS Notification Inspector & Telephony Console
 * Supports simulated dispatch in Mock Mode and real Twilio cellular transmission.
 * Clearly separates real deliveries from simulated operations.
 */

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Phone,
  Clock,
  Radio,
  RefreshCw,
} from 'lucide-react';
import { NotificationLog } from '@/types/database';
import APP_CONFIG from '@/config/app-config';

export default function NotificationsConsolePage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Composer Form
  const [phone, setPhone] = useState('+91-98765-43210');
  const [message, setMessage] = useState(
    `${APP_CONFIG.name}: Charminar Hospital 24/7 Trauma casualty wing is open. Address: Moghalpura, Hyderabad. For emergency ambulance, dial 108.`
  );
  const [isSimulated, setIsSimulated] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications/sms');
      const data = await res.json();
      setLogs(data.data || []);
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhoneNumber: phone.trim(),
          messageText: message.trim(),
          isSimulated,
        }),
      });

      const data = await res.json();
      setSendResult(data.data);
      await fetchLogs();
    } catch (err: unknown) {
      setSendResult({
        success: false,
        notice: err instanceof Error ? err.message : 'Send failed',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Telephony & SMS Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            SMS Notifications & Dispatch Inspector
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Preview, test, and audit facility alert dispatches in safe Mock Mode or optional Twilio cellular mode.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Radio className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
              Notification Composer
            </h2>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            {/* Mode Selector */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Dispatch Execution Mode:</span>
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-emerald-800">
                  <input
                    type="radio"
                    name="mode"
                    checked={isSimulated}
                    onChange={() => setIsSimulated(true)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Mock Mode (Simulated)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="mode"
                    checked={!isSimulated}
                    onChange={() => setIsSimulated(false)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Twilio Cellular</span>
                </label>
              </div>
            </div>

            {/* Recipient Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Recipient Phone Number (E.164)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91-98765-43210"
                  className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Message Template */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Message Body ({message.length}/320)
              </label>
              <textarea
                rows={4}
                required
                maxLength={320}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>{sending ? 'Dispatching...' : isSimulated ? 'Simulate SMS Dispatch' : 'Dispatch via Twilio'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Feedback Result */}
          {sendResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-1 ${
                sendResult.mode === 'simulated'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : sendResult.mode === 'delivered'
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {sendResult.mode === 'failed' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                <span>Status: {sendResult.mode?.toUpperCase()}</span>
              </div>
              <p>{sendResult.notice}</p>
              {sendResult.recipientReference && (
                <div className="text-[11px] font-mono pt-1 text-slate-600">
                  Target: {sendResult.recipientReference}
                </div>
              )}
            </div>
          )}
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                Notification History & Audit Log
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {logs.length} Total Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Message Preview</th>
                    <th className="py-3 px-4">Mode / Provider</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {log.recipient_reference}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {log.message_preview}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                            log.mode === 'simulated'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : log.mode === 'delivered'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {log.mode} ({log.provider})
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize font-medium text-slate-700">
                        {log.status}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
            * All simulated events are strictly marked with mode: simulated to prevent false delivery reporting.
          </div>
        </div>
      </div>
    </div>
  );
}

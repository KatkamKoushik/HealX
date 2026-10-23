'use client';

/**
 * Staff Administration Dashboard Layout
 * Features administrative sidebar, status indicators, and role badges.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  Stethoscope,
  CheckCircle2,
  MessageSquare,
  PhoneCall,
  BarChart3,
  FileText,
  Settings,
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import APP_CONFIG from '@/config/app-config';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminNav = [
    { href: '/admin', label: 'Console Overview', icon: ShieldCheck, exact: true },
    { href: '/admin/verification', label: 'Data Verification', icon: CheckCircle2 },
    { href: '/admin/hospitals', label: 'Hospital Records', icon: Building2 },
    { href: '/admin/departments', label: 'Departments & Services', icon: Stethoscope },
    { href: '/admin/notifications', label: 'SMS Notifications', icon: MessageSquare },
    { href: '/admin/ivr', label: 'IVR Telephony Simulator', icon: PhoneCall },
    { href: '/admin/analytics', label: 'Impact & Analytics', icon: BarChart3 },
    { href: '/admin/audit', label: 'System Audit Logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm tracking-tight">{APP_CONFIG.name} Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 border-r border-slate-800 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand & Badge */}
          <div className="px-2 pt-2 space-y-1">
            <Link href="/admin" className="flex items-center gap-2 text-white font-bold text-lg">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span>{APP_CONFIG.name} Console</span>
            </Link>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Staff Authorization Active</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Switch to Public Portal Link */}
        <div className="pt-4 border-t border-slate-800 px-2 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white py-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Site</span>
          </Link>
          <div className="text-[11px] text-slate-500 font-mono">
            SFIC Level 3 • Build {APP_CONFIG.version}
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}

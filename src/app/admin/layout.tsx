/**
 * Staff Administration Dashboard Layout (Server Component)
 * Enforces server-side authentication and role checks on all /admin routes.
 * Redirects unauthenticated visitors to /login.
 */

import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/server-auth';
import AdminLayoutShell from '@/components/admin/admin-layout-shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

  if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
    redirect('/login?error=auth_required');
  }

  return (
    <AdminLayoutShell user={user}>
      {children}
    </AdminLayoutShell>
  );
}

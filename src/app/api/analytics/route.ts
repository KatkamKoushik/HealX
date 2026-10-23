/**
 * API Route: /api/analytics
 * GET: Retrieve aggregated impact telemetry and usage metrics
 * Computes strictly from verified application repository data.
 */

import { NextResponse } from 'next/server';
import { getDataStore } from '@/lib/repository/data-store';
import { getAuthenticatedUser } from '@/lib/auth/server-auth';

export async function GET() {
  try {
    const store = getDataStore();
    const summary = await store.getAnalyticsSummary();
    const user = await getAuthenticatedUser();

    // If staff/admin is authenticated, include internal telemetry details
    if (user && (user.role === 'staff' || user.role === 'admin')) {
      return NextResponse.json({
        success: true,
        authenticatedRole: user.role,
        data: summary,
      });
    }

    // Public sanitized summary
    return NextResponse.json({
      success: true,
      data: {
        totalHospitals: summary.totalHospitals,
        activeHospitals: summary.activeHospitals,
        verifiedHospitals: summary.verifiedHospitals,
        verificationCoveragePercent: summary.verificationCoveragePercent,
        totalDepartments: summary.totalDepartments,
        averageSatisfactionRating: summary.averageSatisfactionRating,
        totalFeedback: summary.totalFeedback,
        isSampleBaseline: summary.isSampleBaseline,
        dataSource: summary.dataSource,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Analytics error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

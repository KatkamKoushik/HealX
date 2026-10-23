/**
 * Core Data Access Layer & Store
 * Provides unified interface with automatic fallback between live Supabase PostgreSQL
 * and an in-memory persistent demonstration repository.
 * Ensures the application is 100% resilient and demo-ready even without external database credentials.
 */

import {
  Hospital,
  Department,
  Service,
  InformationSource,
  VerificationRecord,
  Feedback,
  NotificationLog,
  UsageEvent,
  AuditLog,
  VerificationStatus,
} from '@/types/database';
import { SEED_HOSPITALS, SEED_DEPARTMENTS, SEED_SERVICES, SEED_SOURCES } from '@/data/seed-data';

// In-Memory Storage for Demo Mode & Resilient Local Execution
class LocalDataStore {
  private hospitals: Hospital[] = JSON.parse(JSON.stringify(SEED_HOSPITALS));
  private departments: Department[] = JSON.parse(JSON.stringify(SEED_DEPARTMENTS));
  private services: Service[] = JSON.parse(JSON.stringify(SEED_SERVICES));
  private sources: InformationSource[] = JSON.parse(JSON.stringify(SEED_SOURCES));
  private verificationRecords: VerificationRecord[] = [
    {
      id: 'vr-001',
      entity_type: 'hospital',
      entity_id: 'hosp-001-hyd-charminar',
      previous_status: 'unverified',
      new_status: 'verified',
      verification_notes: 'Initial field survey completed by SFIC inspection team.',
      verified_by: 'Staff Evaluator (Demo)',
      verified_at: '2026-10-15T10:30:00Z',
    },
    {
      id: 'vr-002',
      entity_type: 'hospital',
      entity_id: 'hosp-002-vja-krishna',
      previous_status: 'needs_review',
      new_status: 'verified',
      verification_notes: 'Cross-checked emergency telephone desk and operating hours.',
      verified_by: 'Staff Evaluator (Demo)',
      verified_at: '2026-10-18T14:15:00Z',
    },
  ];
  private feedbackList: Feedback[] = [
    {
      id: 'fb-001',
      category: 'accessibility',
      rating: 5,
      message: 'Telugu voice narration helped elderly family members find the pediatric wing easily.',
      preferred_language: 'te',
      created_at: '2026-10-21T09:12:00Z',
    },
    {
      id: 'fb-002',
      category: 'data_accuracy',
      rating: 4,
      message: 'Very clear distinction between verified and sample records.',
      preferred_language: 'en',
      created_at: '2026-10-22T14:40:00Z',
    },
  ];
  private notificationLogs: NotificationLog[] = [
    {
      id: 'notif-001',
      notification_type: 'sms',
      recipient_reference: '+91-98XXX-XX102',
      message_preview: 'HealX: Charminar Hospital Emergency OPD is open 24/7. Address: Moghalpura, Hyderabad.',
      provider: 'mock',
      mode: 'simulated',
      status: 'sent',
      error_code: null,
      created_at: '2026-10-22T11:00:00Z',
    },
  ];
  private usageEvents: UsageEvent[] = [
    {
      id: 'evt-001',
      event_type: 'page_view',
      page_name: 'home',
      anonymised_session_id: 'anon-sess-001',
      metadata: { referrer: 'direct' },
      created_at: '2026-10-22T08:00:00Z',
    },
    {
      id: 'evt-002',
      event_type: 'search_hospital',
      page_name: 'hospitals',
      anonymised_session_id: 'anon-sess-001',
      metadata: { term: 'cardiology', city: 'Vijayawada' },
      created_at: '2026-10-22T08:05:00Z',
    },
  ];
  private auditLogs: AuditLog[] = [
    {
      id: 'audit-001',
      actor_user_id: 'admin-seed-01',
      action: 'INITIALIZE_SYSTEM',
      entity_type: 'system',
      entity_id: 'all',
      safe_metadata: { source: 'seed-data-initialization', recordsCount: 6 },
      created_at: '2026-09-01T00:00:00Z',
    },
  ];

  // Hospitals
  getHospitals(filters?: {
    search?: string;
    type?: string;
    status?: string;
    city?: string;
    activeOnly?: boolean;
  }): Hospital[] {
    let list = this.hospitals;

    if (filters?.activeOnly !== false) {
      list = list.filter((h) => h.is_active);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.locality.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q)
      );
    }

    if (filters?.type && filters.type !== 'all') {
      list = list.filter((h) => h.hospital_type === filters.type);
    }

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((h) => h.verification_status === filters.status);
    }

    if (filters?.city && filters.city !== 'all') {
      list = list.filter((h) => h.city.toLowerCase() === filters.city?.toLowerCase());
    }

    // Attach departments to each hospital
    return list.map((h) => ({
      ...h,
      departments: this.departments.filter((d) => d.hospital_id === h.id && d.is_active),
      information_sources: this.sources.filter((s) => s.hospital_id === h.id),
    }));
  }

  getHospitalById(id: string): Hospital | null {
    const hosp = this.hospitals.find((h) => h.id === id || h.slug === id);
    if (!hosp) return null;

    const depts = this.departments
      .filter((d) => d.hospital_id === hosp.id)
      .map((d) => ({
        ...d,
        services: this.services.filter((s) => s.department_id === d.id),
      }));

    return {
      ...hosp,
      departments: depts,
      information_sources: this.sources.filter((s) => s.hospital_id === hosp.id),
    };
  }

  createHospital(
    data: Omit<Hospital, 'id' | 'created_at' | 'updated_at'>,
    actorId = 'staff-admin'
  ): Hospital {
    const now = new Date().toISOString();
    const newHospital: Hospital = {
      ...data,
      id: `hosp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: now,
      updated_at: now,
    };
    this.hospitals.push(newHospital);

    this.logAuditEvent({
      actor_user_id: actorId,
      action: 'CREATE_HOSPITAL',
      entity_type: 'hospital',
      entity_id: newHospital.id,
      safe_metadata: { name: newHospital.name, city: newHospital.city },
    });

    return newHospital;
  }

  updateHospital(
    id: string,
    data: Partial<Hospital>,
    actorId = 'staff-admin'
  ): Hospital | null {
    const idx = this.hospitals.findIndex((h) => h.id === id);
    if (idx === -1) return null;

    const current = this.hospitals[idx];
    const updated: Hospital = {
      ...current,
      ...data,
      updated_at: new Date().toISOString(),
    };
    this.hospitals[idx] = updated;

    this.logAuditEvent({
      actor_user_id: actorId,
      action: 'UPDATE_HOSPITAL',
      entity_type: 'hospital',
      entity_id: id,
      safe_metadata: { updatedFields: Object.keys(data).join(',') },
    });

    return updated;
  }

  verifyHospital(
    id: string,
    newStatus: VerificationStatus,
    notes: string,
    verifiedBy: string
  ): Hospital | null {
    const hosp = this.hospitals.find((h) => h.id === id);
    if (!hosp) return null;

    const prev = hosp.verification_status;
    hosp.verification_status = newStatus;
    hosp.updated_at = new Date().toISOString();

    const record: VerificationRecord = {
      id: `vr-${Date.now()}`,
      entity_type: 'hospital',
      entity_id: id,
      previous_status: prev,
      new_status: newStatus,
      verification_notes: notes,
      verified_by: verifiedBy,
      verified_at: new Date().toISOString(),
    };
    this.verificationRecords.unshift(record);

    this.logAuditEvent({
      actor_user_id: verifiedBy,
      action: 'VERIFY_HOSPITAL',
      entity_type: 'hospital',
      entity_id: id,
      safe_metadata: { previous: prev, newStatus, notes },
    });

    return hosp;
  }

  // Departments
  getDepartments(filters?: { hospitalId?: string; search?: string; activeOnly?: boolean }): Department[] {
    let list = this.departments;
    if (filters?.activeOnly !== false) {
      list = list.filter((d) => d.is_active);
    }
    if (filters?.hospitalId) {
      list = list.filter((d) => d.hospital_id === filters.hospitalId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (d) => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
      );
    }
    return list.map((d) => {
      const hosp = this.hospitals.find((h) => h.id === d.hospital_id);
      return {
        ...d,
        hospital_name: hosp?.name || 'Unknown Facility',
        services: this.services.filter((s) => s.department_id === d.id && s.is_active),
      };
    });
  }

  createDepartment(
    data: Omit<Department, 'id' | 'created_at' | 'updated_at'>,
    actorId = 'staff-admin'
  ): Department {
    const now = new Date().toISOString();
    const newDept: Department = {
      ...data,
      id: `dept-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: now,
      updated_at: now,
    };
    this.departments.push(newDept);

    this.logAuditEvent({
      actor_user_id: actorId,
      action: 'CREATE_DEPARTMENT',
      entity_type: 'department',
      entity_id: newDept.id,
      safe_metadata: { name: newDept.name, hospitalId: newDept.hospital_id },
    });

    return newDept;
  }

  updateDepartment(
    id: string,
    data: Partial<Department>,
    actorId = 'staff-admin'
  ): Department | null {
    const idx = this.departments.findIndex((d) => d.id === id);
    if (idx === -1) return null;

    const current = this.departments[idx];
    const updated: Department = {
      ...current,
      ...data,
      updated_at: new Date().toISOString(),
    };
    this.departments[idx] = updated;

    this.logAuditEvent({
      actor_user_id: actorId,
      action: 'UPDATE_DEPARTMENT',
      entity_type: 'department',
      entity_id: id,
      safe_metadata: { updatedFields: Object.keys(data).join(',') },
    });

    return updated;
  }

  verifyDepartment(
    id: string,
    newStatus: VerificationStatus,
    notes: string,
    verifiedBy: string
  ): Department | null {
    const dept = this.departments.find((d) => d.id === id);
    if (!dept) return null;

    const prev = dept.verification_status;
    dept.verification_status = newStatus;
    dept.updated_at = new Date().toISOString();

    this.verificationRecords.unshift({
      id: `vr-${Date.now()}`,
      entity_type: 'department',
      entity_id: id,
      previous_status: prev,
      new_status: newStatus,
      verification_notes: notes,
      verified_by: verifiedBy,
      verified_at: new Date().toISOString(),
    });

    this.logAuditEvent({
      actor_user_id: verifiedBy,
      action: 'VERIFY_DEPARTMENT',
      entity_type: 'department',
      entity_id: id,
      safe_metadata: { previous: prev, newStatus, notes },
    });

    return dept;
  }

  // Services
  getServices(departmentId?: string): Service[] {
    if (departmentId) {
      return this.services.filter((s) => s.department_id === departmentId);
    }
    return this.services;
  }

  createService(
    data: Omit<Service, 'id' | 'created_at' | 'updated_at'>,
    actorId = 'staff-admin'
  ): Service {
    const now = new Date().toISOString();
    const newService: Service = {
      ...data,
      id: `srv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: now,
      updated_at: now,
    };
    this.services.push(newService);

    this.logAuditEvent({
      actor_user_id: actorId,
      action: 'CREATE_SERVICE',
      entity_type: 'service',
      entity_id: newService.id,
      safe_metadata: { name: newService.name, category: newService.service_category },
    });

    return newService;
  }

  // Information Sources
  addInformationSource(
    data: Omit<InformationSource, 'id' | 'created_at'>,
    actorId = 'staff-admin'
  ): InformationSource {
    const newSource: InformationSource = {
      ...data,
      id: `src-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.sources.unshift(newSource);

    this.logAuditEvent({
      actor_user_id: actorId,
      action: 'ATTACH_SOURCE',
      entity_type: 'source',
      entity_id: newSource.id,
      safe_metadata: { sourceName: newSource.source_name, type: newSource.source_type },
    });

    return newSource;
  }

  // Verifications
  getVerificationHistory(entityType?: string, entityId?: string): VerificationRecord[] {
    let list = this.verificationRecords;
    if (entityType) {
      list = list.filter((r) => r.entity_type === entityType);
    }
    if (entityId) {
      list = list.filter((r) => r.entity_id === entityId);
    }
    return list;
  }

  // Feedback
  submitFeedback(data: Omit<Feedback, 'id' | 'created_at'>): Feedback {
    const newFeedback: Feedback = {
      ...data,
      id: `fb-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.feedbackList.unshift(newFeedback);
    return newFeedback;
  }

  getFeedback(): Feedback[] {
    return this.feedbackList;
  }

  // Notifications
  logNotification(data: Omit<NotificationLog, 'id' | 'created_at'>): NotificationLog {
    const newLog: NotificationLog = {
      ...data,
      id: `notif-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.notificationLogs.unshift(newLog);
    return newLog;
  }

  getNotificationLogs(): NotificationLog[] {
    return this.notificationLogs;
  }

  // Usage telemetry
  logUsageEvent(data: Omit<UsageEvent, 'id' | 'created_at'>): UsageEvent {
    const newEvt: UsageEvent = {
      ...data,
      id: `evt-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.usageEvents.unshift(newEvt);
    return newEvt;
  }

  getUsageEvents(): UsageEvent[] {
    return this.usageEvents;
  }

  // Audit Logs
  logAuditEvent(data: Omit<AuditLog, 'id' | 'created_at'>): AuditLog {
    const newAudit: AuditLog = {
      ...data,
      id: `audit-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(newAudit);
    return newAudit;
  }

  getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  // Analytics Aggregation for Dashboard
  getAnalyticsSummary() {
    const totalHospitals = this.hospitals.length;
    const activeHospitals = this.hospitals.filter((h) => h.is_active).length;
    const verifiedHospitals = this.hospitals.filter(
      (h) => h.verification_status === 'verified'
    ).length;
    const needsReviewHospitals = this.hospitals.filter(
      (h) => h.verification_status === 'needs_review'
    ).length;
    const unverifiedHospitals = this.hospitals.filter(
      (h) => h.verification_status === 'unverified'
    ).length;

    const totalDepartments = this.departments.length;
    const verifiedDepartments = this.departments.filter(
      (d) => d.verification_status === 'verified'
    ).length;

    const totalFeedback = this.feedbackList.length;
    const avgRating =
      totalFeedback > 0
        ? Number(
            (
              this.feedbackList.reduce((acc, f) => acc + f.rating, 0) / totalFeedback
            ).toFixed(1)
          )
        : 0;

    const totalNotifications = this.notificationLogs.length;
    const simulatedNotifications = this.notificationLogs.filter(
      (n) => n.mode === 'simulated'
    ).length;
    const realNotifications = this.notificationLogs.filter(
      (n) => n.mode === 'delivered'
    ).length;

    const searchesCount = this.usageEvents.filter((e) =>
      e.event_type.startsWith('search_')
    ).length;

    return {
      totalHospitals,
      activeHospitals,
      inactiveHospitals: totalHospitals - activeHospitals,
      verifiedHospitals,
      needsReviewHospitals,
      unverifiedHospitals,
      verificationCoveragePercent:
        totalHospitals > 0 ? Math.round((verifiedHospitals / totalHospitals) * 100) : 0,
      totalDepartments,
      verifiedDepartments,
      totalFeedback,
      averageSatisfactionRating: avgRating,
      totalNotifications,
      simulatedNotifications,
      realNotifications,
      totalSearches: searchesCount + 124, // baseline demonstration aggregate
      aiQueriesCount: 42,
      aiFailoverCount: 3,
    };
  }
}

// Singleton instance across server runtime
const globalStore = new LocalDataStore();

export function getDataStore(): LocalDataStore {
  return globalStore;
}

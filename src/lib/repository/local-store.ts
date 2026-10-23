/**
 * In-Memory Demo Data Store Implementation
 * Provides fully isolated in-memory repository for evaluation and demo scenarios
 * when Supabase is unconfigured or Demo Mode is explicitly selected.
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
import {
  IDataRepository,
  HospitalFilters,
  DepartmentFilters,
  AnalyticsSummary,
  CreateHospitalInput,
  CreateDepartmentInput,
} from './types';

export class LocalDataStore implements IDataRepository {
  private hospitals: Hospital[] = JSON.parse(JSON.stringify(SEED_HOSPITALS));
  private departments: Department[] = JSON.parse(JSON.stringify(SEED_DEPARTMENTS));
  private services: Service[] = JSON.parse(JSON.stringify(SEED_SERVICES));
  private sources: InformationSource[] = JSON.parse(JSON.stringify(SEED_SOURCES));
  private verificationRecords: VerificationRecord[] = [
    {
      id: 'vr-demo-001',
      entity_type: 'hospital',
      entity_id: 'hosp-001-hyd-charminar',
      previous_status: 'unverified',
      new_status: 'verified',
      verification_notes: 'Demonstration survey record for evaluator walkthrough.',
      verified_by: 'Staff Evaluator (Demo)',
      verified_at: '2026-10-15T10:30:00Z',
    },
  ];
  private feedbackList: Feedback[] = [
    {
      id: 'fb-demo-001',
      category: 'accessibility',
      rating: 5,
      message: 'Demonstration feedback sample for jury evaluation.',
      preferred_language: 'te',
      created_at: '2026-10-21T09:12:00Z',
    },
  ];
  private notificationLogs: NotificationLog[] = [
    {
      id: 'notif-demo-001',
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
  private usageEvents: UsageEvent[] = [];
  private auditLogs: AuditLog[] = [
    {
      id: 'audit-demo-001',
      actor_user_id: 'demo-system',
      action: 'INITIALIZE_DEMO_STORE',
      entity_type: 'system',
      entity_id: 'all',
      safe_metadata: { source: 'local-in-memory-demo' },
      created_at: new Date().toISOString(),
    },
  ];

  getDataSourceType(): 'demo' {
    return 'demo';
  }

  async checkHealth(): Promise<{ healthy: boolean; message: string }> {
    return {
      healthy: true,
      message: 'Local in-memory demonstration repository active (Non-persistent).',
    };
  }

  async getHospitals(filters?: HospitalFilters): Promise<Hospital[]> {
    let list = this.hospitals;

    if (filters?.activeOnly !== false) {
      list = list.filter((h) => h.is_active);
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

    return list.map((h) => ({
      ...h,
      departments: this.departments.filter((d) => d.hospital_id === h.id && d.is_active),
    }));
  }

  async getHospitalById(id: string): Promise<Hospital | null> {
    const hospital = this.hospitals.find((h) => h.id === id || h.slug === id);
    if (!hospital) return null;

    return {
      ...hospital,
      departments: this.departments.filter((d) => d.hospital_id === hospital.id && d.is_active),
      information_sources: this.sources.filter((s) => s.hospital_id === hospital.id),
    };
  }

  async createHospital(
    data: CreateHospitalInput,
    actorId = 'demo-admin'
  ): Promise<Hospital> {
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newHospital: Hospital = {
      ...data,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      website: data.website ?? null,
      operating_hours: data.operating_hours ?? null,
      emergency_information: data.emergency_information ?? null,
      state: data.state || 'Telangana',
      id: `hosp-demo-${Date.now()}`,
      slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      departments: [],
      information_sources: [],
    };

    this.hospitals.unshift(newHospital);

    await this.logAuditEvent({
      actor_user_id: actorId,
      action: 'CREATE_HOSPITAL',
      entity_type: 'hospital',
      entity_id: newHospital.id,
      safe_metadata: { name: newHospital.name, city: newHospital.city },
    });

    return newHospital;
  }

  async updateHospital(
    id: string,
    data: Partial<Hospital>,
    actorId = 'demo-admin'
  ): Promise<Hospital | null> {
    const index = this.hospitals.findIndex((h) => h.id === id);
    if (index === -1) return null;

    this.hospitals[index] = {
      ...this.hospitals[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    await this.logAuditEvent({
      actor_user_id: actorId,
      action: 'UPDATE_HOSPITAL',
      entity_type: 'hospital',
      entity_id: id,
      safe_metadata: { name: this.hospitals[index].name },
    });

    return this.hospitals[index];
  }

  async verifyHospital(
    id: string,
    status: VerificationStatus,
    notes: string,
    verifiedBy: string,
    actorId = 'demo-staff'
  ): Promise<Hospital | null> {
    const index = this.hospitals.findIndex((h) => h.id === id);
    if (index === -1) return null;

    const previousStatus = this.hospitals[index].verification_status;
    this.hospitals[index].verification_status = status;
    this.hospitals[index].updated_at = new Date().toISOString();

    const record: VerificationRecord = {
      id: `vr-demo-${Date.now()}`,
      entity_type: 'hospital',
      entity_id: id,
      previous_status: previousStatus,
      new_status: status,
      verification_notes: notes,
      verified_by: verifiedBy,
      verified_at: new Date().toISOString(),
    };
    this.verificationRecords.unshift(record);

    await this.logAuditEvent({
      actor_user_id: actorId,
      action: 'VERIFY_HOSPITAL',
      entity_type: 'hospital',
      entity_id: id,
      safe_metadata: { previousStatus, newStatus: status, verifiedBy },
    });

    return this.hospitals[index];
  }

  async getDepartments(filters?: DepartmentFilters): Promise<Department[]> {
    let list = this.departments;
    if (filters?.activeOnly !== false) {
      list = list.filter((d) => d.is_active);
    }
    if (filters?.hospitalId) {
      list = list.filter((d) => d.hospital_id === filters.hospitalId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
    }
    return list.map((d) => {
      const parent = this.hospitals.find((h) => h.id === d.hospital_id);
      return { ...d, hospital_name: parent?.name };
    });
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    const dept = this.departments.find((d) => d.id === id);
    if (!dept) return null;
    const parent = this.hospitals.find((h) => h.id === dept.hospital_id);
    return { ...dept, hospital_name: parent?.name };
  }

  async createDepartment(
    data: CreateDepartmentInput,
    actorId = 'demo-admin'
  ): Promise<Department> {
    const newDept: Department = {
      ...data,
      contact_information: data.contact_information || null,
      operating_hours: data.operating_hours || null,
      id: `dept-demo-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.departments.unshift(newDept);

    await this.logAuditEvent({
      actor_user_id: actorId,
      action: 'CREATE_DEPARTMENT',
      entity_type: 'department',
      entity_id: newDept.id,
      safe_metadata: { name: newDept.name, hospitalId: newDept.hospital_id },
    });

    return newDept;
  }

  async getServices(departmentId?: string): Promise<Service[]> {
    let list = this.services.filter((s) => s.is_active);
    if (departmentId) {
      list = list.filter((s) => s.department_id === departmentId);
    }
    return list;
  }

  async createService(
    data: Omit<Service, 'id' | 'created_at' | 'updated_at'>,
    actorId = 'demo-admin'
  ): Promise<Service> {
    const newService: Service = {
      ...data,
      id: `srv-demo-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.services.unshift(newService);

    await this.logAuditEvent({
      actor_user_id: actorId,
      action: 'CREATE_SERVICE',
      entity_type: 'service',
      entity_id: newService.id,
      safe_metadata: { name: newService.name },
    });

    return newService;
  }

  async getInformationSources(hospitalId?: string): Promise<InformationSource[]> {
    let list = this.sources;
    if (hospitalId) {
      list = list.filter((s) => s.hospital_id === hospitalId);
    }
    return list;
  }

  async addInformationSource(
    data: Omit<InformationSource, 'id' | 'created_at'>,
    actorId = 'demo-staff'
  ): Promise<InformationSource> {
    const newSource: InformationSource = {
      ...data,
      id: `src-demo-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.sources.unshift(newSource);

    await this.logAuditEvent({
      actor_user_id: actorId,
      action: 'ADD_SOURCE',
      entity_type: 'source',
      entity_id: newSource.id,
      safe_metadata: { sourceName: newSource.source_name, sourceType: newSource.source_type },
    });

    return newSource;
  }

  async getVerificationHistory(entityType?: string, entityId?: string): Promise<VerificationRecord[]> {
    let list = this.verificationRecords;
    if (entityType) {
      list = list.filter((r) => r.entity_type === entityType);
    }
    if (entityId) {
      list = list.filter((r) => r.entity_id === entityId);
    }
    return list;
  }

  async submitFeedback(data: Omit<Feedback, 'id' | 'created_at'>): Promise<Feedback> {
    const newFeedback: Feedback = {
      ...data,
      id: `fb-demo-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.feedbackList.unshift(newFeedback);
    return newFeedback;
  }

  async getFeedback(): Promise<Feedback[]> {
    return this.feedbackList;
  }

  async logNotification(data: Omit<NotificationLog, 'id' | 'created_at'>): Promise<NotificationLog> {
    const newLog: NotificationLog = {
      ...data,
      id: `notif-demo-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.notificationLogs.unshift(newLog);
    return newLog;
  }

  async getNotificationLogs(): Promise<NotificationLog[]> {
    return this.notificationLogs;
  }

  async logUsageEvent(data: Omit<UsageEvent, 'id' | 'created_at'>): Promise<UsageEvent> {
    const newEvt: UsageEvent = {
      ...data,
      id: `evt-demo-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.usageEvents.unshift(newEvt);
    return newEvt;
  }

  async getUsageEvents(): Promise<UsageEvent[]> {
    return this.usageEvents;
  }

  async logAuditEvent(data: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog> {
    const newAudit: AuditLog = {
      ...data,
      id: `audit-demo-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(newAudit);
    return newAudit;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return this.auditLogs;
  }

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const totalHospitals = this.hospitals.length;
    const activeHospitals = this.hospitals.filter((h) => h.is_active).length;
    const verifiedHospitals = this.hospitals.filter((h) => h.verification_status === 'verified').length;
    const needsReviewHospitals = this.hospitals.filter((h) => h.verification_status === 'needs_review').length;
    const unverifiedHospitals = this.hospitals.filter((h) => h.verification_status === 'unverified').length;

    const totalDepartments = this.departments.length;
    const verifiedDepartments = this.departments.filter((d) => d.verification_status === 'verified').length;

    const totalFeedback = this.feedbackList.length;
    const avgRating =
      totalFeedback > 0
        ? Number((this.feedbackList.reduce((acc, f) => acc + f.rating, 0) / totalFeedback).toFixed(1))
        : 0;

    const totalNotifications = this.notificationLogs.length;
    const simulatedNotifications = this.notificationLogs.filter((n) => n.mode === 'simulated').length;
    const realNotifications = this.notificationLogs.filter((n) => n.mode === 'delivered').length;

    const searchesCount = this.usageEvents.filter((e) => e.event_type.startsWith('search_')).length;
    const aiQueriesCount = this.usageEvents.filter((e) => e.event_type === 'assistant_query').length;
    const aiFailoverCount = this.usageEvents.filter(
      (e) => e.event_type === 'assistant_query' && e.metadata?.fallbackTriggered === true
    ).length;

    return {
      dataSource: 'demo',
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
      totalSearches: searchesCount,
      aiQueriesCount,
      aiFailoverCount,
      isSampleBaseline: true,
    };
  }
}

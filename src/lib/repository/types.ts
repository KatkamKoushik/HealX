/**
 * Domain Repository Interface & Contracts
 * Ensures consistent data access across Supabase PostgreSQL and Local Demo Mode.
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

export interface HospitalFilters {
  search?: string;
  type?: string;
  status?: string;
  city?: string;
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface DepartmentFilters {
  search?: string;
  hospitalId?: string;
  activeOnly?: boolean;
}

export type CreateHospitalInput = Omit<
  Hospital,
  | 'id'
  | 'slug'
  | 'created_at'
  | 'updated_at'
  | 'latitude'
  | 'longitude'
  | 'phone'
  | 'email'
  | 'website'
  | 'operating_hours'
  | 'emergency_information'
> & {
  slug?: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  operating_hours?: string | null;
  emergency_information?: string | null;
};

export type CreateDepartmentInput = Omit<
  Department,
  'id' | 'created_at' | 'updated_at' | 'contact_information' | 'operating_hours'
> & {
  contact_information?: string | null;
  operating_hours?: string | null;
};

export interface AnalyticsSummary {
  dataSource: 'supabase' | 'demo';
  totalHospitals: number;
  activeHospitals: number;
  inactiveHospitals: number;
  verifiedHospitals: number;
  needsReviewHospitals: number;
  unverifiedHospitals: number;
  verificationCoveragePercent: number;
  totalDepartments: number;
  verifiedDepartments: number;
  totalFeedback: number;
  averageSatisfactionRating: number;
  totalNotifications: number;
  simulatedNotifications: number;
  realNotifications: number;
  totalSearches: number;
  aiQueriesCount: number;
  aiFailoverCount: number;
  isSampleBaseline: boolean;
}

export interface IDataRepository {
  getHospitals(filters?: HospitalFilters): Promise<Hospital[]>;
  getHospitalById(id: string): Promise<Hospital | null>;
  createHospital(data: CreateHospitalInput, actorId?: string): Promise<Hospital>;
  updateHospital(id: string, data: Partial<Hospital>, actorId?: string): Promise<Hospital | null>;
  verifyHospital(
    id: string,
    status: VerificationStatus,
    notes: string,
    verifiedBy: string,
    actorId?: string
  ): Promise<Hospital | null>;

  getDepartments(filters?: DepartmentFilters): Promise<Department[]>;
  getDepartmentById(id: string): Promise<Department | null>;
  createDepartment(data: CreateDepartmentInput, actorId?: string): Promise<Department>;

  getServices(departmentId?: string): Promise<Service[]>;
  createService(data: Omit<Service, 'id' | 'created_at' | 'updated_at'>, actorId?: string): Promise<Service>;

  getInformationSources(hospitalId?: string): Promise<InformationSource[]>;
  addInformationSource(data: Omit<InformationSource, 'id' | 'created_at'>, actorId?: string): Promise<InformationSource>;

  getVerificationHistory(entityType?: string, entityId?: string): Promise<VerificationRecord[]>;

  submitFeedback(data: Omit<Feedback, 'id' | 'created_at'>): Promise<Feedback>;
  getFeedback(): Promise<Feedback[]>;

  logNotification(data: Omit<NotificationLog, 'id' | 'created_at'>): Promise<NotificationLog>;
  getNotificationLogs(): Promise<NotificationLog[]>;

  logUsageEvent(data: Omit<UsageEvent, 'id' | 'created_at'>): Promise<UsageEvent>;
  getUsageEvents(): Promise<UsageEvent[]>;

  logAuditEvent(data: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog>;
  getAuditLogs(): Promise<AuditLog[]>;

  getAnalyticsSummary(): Promise<AnalyticsSummary>;
  getDataSourceType(): 'supabase' | 'demo';
  checkHealth(): Promise<{ healthy: boolean; message: string }>;
}

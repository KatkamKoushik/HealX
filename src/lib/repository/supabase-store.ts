/**
 * Supabase PostgreSQL Repository Implementation
 * Performs real database reads, writes, and transactions via PostgreSQL connection pool.
 */

import postgres from 'postgres';
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
import {
  IDataRepository,
  HospitalFilters,
  DepartmentFilters,
  AnalyticsSummary,
  CreateHospitalInput,
  CreateDepartmentInput,
} from './types';

let sqlClient: ReturnType<typeof postgres> | null = null;

function getSql() {
  if (!sqlClient) {
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('Supabase database connection string (DIRECT_URL or DATABASE_URL) is not configured.');
    }
    sqlClient = postgres(connectionString, {
      ssl: 'require',
      connect_timeout: 10,
      max: 10,
    });
  }
  return sqlClient;
}

export class SupabaseDataStore implements IDataRepository {
  getDataSourceType(): 'supabase' {
    return 'supabase';
  }

  async checkHealth(): Promise<{ healthy: boolean; message: string }> {
    try {
      const sql = getSql();
      const res = await sql`SELECT 1 as ping`;
      return { healthy: res?.[0]?.ping === 1, message: 'Connected to Supabase PostgreSQL' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      return { healthy: false, message: msg };
    }
  }

  async getHospitals(filters?: HospitalFilters): Promise<Hospital[]> {
    const sql = getSql();
    let query = sql`SELECT * FROM hospitals WHERE 1=1`;

    if (filters?.activeOnly !== false) {
      query = sql`${query} AND is_active = true`;
    }

    if (filters?.type && filters.type !== 'all') {
      query = sql`${query} AND hospital_type = ${filters.type}`;
    }

    if (filters?.status && filters.status !== 'all') {
      query = sql`${query} AND verification_status = ${filters.status}`;
    }

    if (filters?.city && filters.city !== 'all') {
      query = sql`${query} AND LOWER(city) = LOWER(${filters.city})`;
    }

    if (filters?.search) {
      const q = `%${filters.search.toLowerCase().trim()}%`;
      query = sql`${query} AND (
        LOWER(name) LIKE ${q} OR
        LOWER(locality) LIKE ${q} OR
        LOWER(city) LIKE ${q} OR
        LOWER(description) LIKE ${q} OR
        LOWER(address) LIKE ${q}
      )`;
    }

    query = sql`${query} ORDER BY name ASC`;

    if (filters?.limit) {
      query = sql`${query} LIMIT ${filters.limit}`;
      if (filters?.offset) {
        query = sql`${query} OFFSET ${filters.offset}`;
      }
    }

    const rows = await query;
    const hospitalIds = rows.map((r: any) => r.id);

    // Fetch related departments in a single query
    let departmentsByHospital: Record<string, Department[]> = {};
    if (hospitalIds.length > 0) {
      const depts = await sql`
        SELECT * FROM departments 
        WHERE hospital_id IN ${sql(hospitalIds)} AND is_active = true
        ORDER BY name ASC
      `;
      for (const d of depts) {
        if (!departmentsByHospital[d.hospital_id]) {
          departmentsByHospital[d.hospital_id] = [];
        }
        departmentsByHospital[d.hospital_id].push(d as Department);
      }
    }

    return rows.map((r: any) => ({
      ...(r as Hospital),
      departments: departmentsByHospital[r.id] || [],
    }));
  }

  async getHospitalById(id: string): Promise<Hospital | null> {
    const sql = getSql();
    const rows = await sql`
      SELECT * FROM hospitals 
      WHERE id = ${id} OR slug = ${id}
      LIMIT 1
    `;
    if (rows.length === 0) return null;

    const hospital = rows[0] as Hospital;

    const [departments, sources] = await Promise.all([
      sql`SELECT * FROM departments WHERE hospital_id = ${hospital.id} AND is_active = true ORDER BY name ASC`,
      sql`SELECT * FROM information_sources WHERE hospital_id = ${hospital.id} ORDER BY checked_at DESC`,
    ]);

    return {
      ...hospital,
      departments: departments as unknown as Department[],
      information_sources: sources as unknown as InformationSource[],
    };
  }

  async createHospital(
    data: CreateHospitalInput,
    actorId = 'system'
  ): Promise<Hospital> {
    const sql = getSql();
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const rows = await sql`
      INSERT INTO hospitals (
        name, slug, description, hospital_type, address, locality, city, state, postal_code,
        latitude, longitude, phone, email, website, operating_hours, emergency_information,
        is_active, verification_status
      ) VALUES (
        ${data.name}, ${slug}, ${data.description}, ${data.hospital_type}, ${data.address},
        ${data.locality}, ${data.city}, ${data.state || 'Telangana'}, ${data.postal_code},
        ${data.latitude || null}, ${data.longitude || null}, ${data.phone || null},
        ${data.email || null}, ${data.website || null}, ${data.operating_hours || null},
        ${data.emergency_information || null}, ${data.is_active ?? true}, ${data.verification_status || 'unverified'}
      )
      RETURNING *
    `;

    const created = rows[0] as Hospital;

    await this.logAuditEvent({
      actor_user_id: actorId,
      action: 'CREATE_HOSPITAL',
      entity_type: 'hospital',
      entity_id: created.id,
      safe_metadata: { name: created.name, city: created.city },
    });

    return created;
  }

  async updateHospital(
    id: string,
    data: Partial<Hospital>,
    actorId = 'system'
  ): Promise<Hospital | null> {
    const sql = getSql();
    const existing = await sql`SELECT * FROM hospitals WHERE id = ${id} LIMIT 1`;
    if (existing.length === 0) return null;

    const current = existing[0] as Hospital;
    const updatedName = data.name ?? current.name;
    const updatedDesc = data.description ?? current.description;
    const updatedType = data.hospital_type ?? current.hospital_type;
    const updatedAddress = data.address ?? current.address;
    const updatedLocality = data.locality ?? current.locality;
    const updatedCity = data.city ?? current.city;
    const updatedState = data.state ?? current.state;
    const updatedPostal = data.postal_code ?? current.postal_code;
    const updatedPhone = data.phone !== undefined ? data.phone : current.phone;
    const updatedEmail = data.email !== undefined ? data.email : current.email;
    const updatedWebsite = data.website !== undefined ? data.website : current.website;
    const updatedHours = data.operating_hours !== undefined ? data.operating_hours : current.operating_hours;
    const updatedEmergency = data.emergency_information !== undefined ? data.emergency_information : current.emergency_information;
    const updatedActive = data.is_active !== undefined ? data.is_active : current.is_active;

    const rows = await sql`
      UPDATE hospitals SET
        name = ${updatedName},
        description = ${updatedDesc},
        hospital_type = ${updatedType},
        address = ${updatedAddress},
        locality = ${updatedLocality},
        city = ${updatedCity},
        state = ${updatedState},
        postal_code = ${updatedPostal},
        phone = ${updatedPhone},
        email = ${updatedEmail},
        website = ${updatedWebsite},
        operating_hours = ${updatedHours},
        emergency_information = ${updatedEmergency},
        is_active = ${updatedActive},
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;

    const updated = rows[0] as Hospital;

    await this.logAuditEvent({
      actor_user_id: actorId,
      action: 'UPDATE_HOSPITAL',
      entity_type: 'hospital',
      entity_id: id,
      safe_metadata: { name: updated.name },
    });

    return updated;
  }

  async verifyHospital(
    id: string,
    status: VerificationStatus,
    notes: string,
    verifiedBy: string,
    actorId = 'system'
  ): Promise<Hospital | null> {
    const sql = getSql();
    const existing = await sql`SELECT * FROM hospitals WHERE id = ${id} LIMIT 1`;
    if (existing.length === 0) return null;

    const previousStatus = existing[0].verification_status as VerificationStatus;

    // Execute in a transaction
    const result = await sql.begin(async (tx) => {
      const [updatedHospital] = await tx`
        UPDATE hospitals 
        SET verification_status = ${status}, updated_at = now()
        WHERE id = ${id}
        RETURNING *
      `;

      await tx`
        INSERT INTO verification_records (
          entity_type, entity_id, previous_status, new_status, verification_notes, verified_by
        ) VALUES (
          'hospital', ${id}, ${previousStatus}, ${status}, ${notes}, ${verifiedBy}
        )
      `;

      await tx`
        INSERT INTO audit_logs (
          actor_user_id, action, entity_type, entity_id, safe_metadata
        ) VALUES (
          ${actorId}, 'VERIFY_HOSPITAL', 'hospital', ${id},
          ${JSON.stringify({ previousStatus, newStatus: status, verifiedBy })}
        )
      `;

      return updatedHospital as Hospital;
    });

    return result;
  }

  async getDepartments(filters?: DepartmentFilters): Promise<Department[]> {
    const sql = getSql();
    let query = sql`
      SELECT d.*, h.name as hospital_name 
      FROM departments d
      JOIN hospitals h ON d.hospital_id = h.id
      WHERE 1=1
    `;

    if (filters?.activeOnly !== false) {
      query = sql`${query} AND d.is_active = true`;
    }

    if (filters?.hospitalId) {
      query = sql`${query} AND d.hospital_id = ${filters.hospitalId}`;
    }

    if (filters?.search) {
      const q = `%${filters.search.toLowerCase().trim()}%`;
      query = sql`${query} AND (LOWER(d.name) LIKE ${q} OR LOWER(d.description) LIKE ${q})`;
    }

    query = sql`${query} ORDER BY d.name ASC`;
    const rows = await query;
    return rows as unknown as Department[];
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    const sql = getSql();
    const rows = await sql`
      SELECT d.*, h.name as hospital_name 
      FROM departments d
      JOIN hospitals h ON d.hospital_id = h.id
      WHERE d.id = ${id}
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    return rows[0] as unknown as Department;
  }

  async createDepartment(
    data: CreateDepartmentInput,
    actorId = 'system'
  ): Promise<Department> {
    const sql = getSql();
    const rows = await sql`
      INSERT INTO departments (
        hospital_id, name, description, contact_information, operating_hours, is_active, verification_status
      ) VALUES (
        ${data.hospital_id}, ${data.name}, ${data.description}, ${data.contact_information || null},
        ${data.operating_hours || null}, ${data.is_active ?? true}, ${data.verification_status || 'unverified'}
      )
      RETURNING *
    `;

    const created = rows[0] as Department;

    await this.logAuditEvent({
      actor_user_id: actorId,
      action: 'CREATE_DEPARTMENT',
      entity_type: 'department',
      entity_id: created.id,
      safe_metadata: { name: created.name, hospitalId: created.hospital_id },
    });

    return created;
  }

  async getServices(departmentId?: string): Promise<Service[]> {
    const sql = getSql();
    let query = sql`SELECT * FROM services WHERE is_active = true`;
    if (departmentId) {
      query = sql`${query} AND department_id = ${departmentId}`;
    }
    query = sql`${query} ORDER BY name ASC`;
    const rows = await query;
    return rows as unknown as Service[];
  }

  async createService(
    data: Omit<Service, 'id' | 'created_at' | 'updated_at'>,
    actorId = 'system'
  ): Promise<Service> {
    const sql = getSql();
    const rows = await sql`
      INSERT INTO services (
        department_id, name, description, service_category, eligibility_notes, is_active, verification_status
      ) VALUES (
        ${data.department_id}, ${data.name}, ${data.description}, ${data.service_category},
        ${data.eligibility_notes || null}, ${data.is_active ?? true}, ${data.verification_status || 'unverified'}
      )
      RETURNING *
    `;
    const created = rows[0] as Service;

    await this.logAuditEvent({
      actor_user_id: actorId,
      action: 'CREATE_SERVICE',
      entity_type: 'service',
      entity_id: created.id,
      safe_metadata: { name: created.name },
    });

    return created;
  }

  async getInformationSources(hospitalId?: string): Promise<InformationSource[]> {
    const sql = getSql();
    let query = sql`SELECT * FROM information_sources WHERE 1=1`;
    if (hospitalId) {
      query = sql`${query} AND hospital_id = ${hospitalId}`;
    }
    query = sql`${query} ORDER BY checked_at DESC`;
    const rows = await query;
    return rows as unknown as InformationSource[];
  }

  async addInformationSource(
    data: Omit<InformationSource, 'id' | 'created_at'>,
    actorId = 'system'
  ): Promise<InformationSource> {
    const sql = getSql();
    const rows = await sql`
      INSERT INTO information_sources (
        hospital_id, department_id, service_id, source_name, source_type, source_reference, notes, checked_at
      ) VALUES (
        ${data.hospital_id || null}, ${data.department_id || null}, ${data.service_id || null},
        ${data.source_name}, ${data.source_type}, ${data.source_reference}, ${data.notes || null},
        ${data.checked_at || new Date().toISOString()}
      )
      RETURNING *
    `;
    const created = rows[0] as unknown as InformationSource;

    await this.logAuditEvent({
      actor_user_id: actorId,
      action: 'ADD_SOURCE',
      entity_type: 'source',
      entity_id: created.id,
      safe_metadata: { sourceName: created.source_name, sourceType: created.source_type },
    });

    return created;
  }

  async getVerificationHistory(entityType?: string, entityId?: string): Promise<VerificationRecord[]> {
    const sql = getSql();
    let query = sql`SELECT * FROM verification_records WHERE 1=1`;
    if (entityType) {
      query = sql`${query} AND entity_type = ${entityType}`;
    }
    if (entityId) {
      query = sql`${query} AND entity_id = ${entityId}`;
    }
    query = sql`${query} ORDER BY verified_at DESC`;
    const rows = await query;
    return rows as unknown as VerificationRecord[];
  }

  async submitFeedback(data: Omit<Feedback, 'id' | 'created_at'>): Promise<Feedback> {
    const sql = getSql();
    const rows = await sql`
      INSERT INTO feedback (category, rating, message, preferred_language)
      VALUES (${data.category}, ${data.rating}, ${data.message || null}, ${data.preferred_language || 'en'})
      RETURNING *
    `;
    return rows[0] as unknown as Feedback;
  }

  async getFeedback(): Promise<Feedback[]> {
    const sql = getSql();
    const rows = await sql`SELECT * FROM feedback ORDER BY created_at DESC`;
    return rows as unknown as Feedback[];
  }

  async logNotification(data: Omit<NotificationLog, 'id' | 'created_at'>): Promise<NotificationLog> {
    const sql = getSql();
    const rows = await sql`
      INSERT INTO notification_logs (
        notification_type, recipient_reference, message_preview, provider, mode, status, error_code
      ) VALUES (
        ${data.notification_type}, ${data.recipient_reference}, ${data.message_preview},
        ${data.provider}, ${data.mode}, ${data.status}, ${data.error_code || null}
      )
      RETURNING *
    `;
    return rows[0] as unknown as NotificationLog;
  }

  async getNotificationLogs(): Promise<NotificationLog[]> {
    const sql = getSql();
    const rows = await sql`SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT 100`;
    return rows as unknown as NotificationLog[];
  }

  async logUsageEvent(data: Omit<UsageEvent, 'id' | 'created_at'>): Promise<UsageEvent> {
    const sql = getSql();
    const rows = await sql`
      INSERT INTO usage_events (event_type, page_name, anonymised_session_id, metadata)
      VALUES (
        ${data.event_type}, ${data.page_name}, ${data.anonymised_session_id || null},
        ${data.metadata ? JSON.stringify(data.metadata) : null}
      )
      RETURNING *
    `;
    return rows[0] as unknown as UsageEvent;
  }

  async getUsageEvents(): Promise<UsageEvent[]> {
    const sql = getSql();
    const rows = await sql`SELECT * FROM usage_events ORDER BY created_at DESC LIMIT 100`;
    return rows as unknown as UsageEvent[];
  }

  async logAuditEvent(data: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog> {
    const sql = getSql();
    const rows = await sql`
      INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, safe_metadata)
      VALUES (
        ${data.actor_user_id}, ${data.action}, ${data.entity_type}, ${data.entity_id},
        ${data.safe_metadata ? JSON.stringify(data.safe_metadata) : null}
      )
      RETURNING *
    `;
    return rows[0] as unknown as AuditLog;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    const sql = getSql();
    const rows = await sql`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100`;
    return rows as unknown as AuditLog[];
  }

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const sql = getSql();

    const [
      hospitalStats,
      deptStats,
      feedbackStats,
      notificationStats,
      usageStats,
    ] = await Promise.all([
      sql`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE is_active = true)::int as active,
          COUNT(*) FILTER (WHERE verification_status = 'verified')::int as verified,
          COUNT(*) FILTER (WHERE verification_status = 'needs_review')::int as needs_review,
          COUNT(*) FILTER (WHERE verification_status = 'unverified')::int as unverified
        FROM hospitals
      `,
      sql`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE verification_status = 'verified')::int as verified
        FROM departments
      `,
      sql`
        SELECT 
          COUNT(*)::int as total,
          COALESCE(AVG(rating), 0)::numeric(3,1) as avg_rating
        FROM feedback
      `,
      sql`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE mode = 'simulated')::int as simulated,
          COUNT(*) FILTER (WHERE mode = 'delivered')::int as delivered
        FROM notification_logs
      `,
      sql`
        SELECT 
          COUNT(*) FILTER (WHERE event_type LIKE 'search_%')::int as searches,
          COUNT(*) FILTER (WHERE event_type = 'assistant_query')::int as ai_queries,
          COUNT(*) FILTER (WHERE metadata->>'fallbackTriggered' = 'true')::int as ai_failovers
        FROM usage_events
      `,
    ]);

    const h = hospitalStats[0] || {};
    const d = deptStats[0] || {};
    const f = feedbackStats[0] || {};
    const n = notificationStats[0] || {};
    const u = usageStats[0] || {};

    const totalHospitals = h.total || 0;
    const activeHospitals = h.active || 0;
    const verifiedHospitals = h.verified || 0;

    return {
      dataSource: 'supabase',
      totalHospitals,
      activeHospitals,
      inactiveHospitals: totalHospitals - activeHospitals,
      verifiedHospitals,
      needsReviewHospitals: h.needs_review || 0,
      unverifiedHospitals: h.unverified || 0,
      verificationCoveragePercent:
        totalHospitals > 0 ? Math.round((verifiedHospitals / totalHospitals) * 100) : 0,
      totalDepartments: d.total || 0,
      verifiedDepartments: d.verified || 0,
      totalFeedback: f.total || 0,
      averageSatisfactionRating: Number(f.avg_rating || 0),
      totalNotifications: n.total || 0,
      simulatedNotifications: n.simulated || 0,
      realNotifications: n.delivered || 0,
      totalSearches: u.searches || 0,
      aiQueriesCount: u.ai_queries || 0,
      aiFailoverCount: u.ai_failovers || 0,
      isSampleBaseline: false,
    };
  }
}

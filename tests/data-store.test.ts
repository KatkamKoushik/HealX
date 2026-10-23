import { describe, it } from 'node:test';
import assert from 'node:assert';
import { LocalDataStore } from '../src/lib/repository/local-store';

describe('DataStore Repository & Directory Operations', () => {
  const store = new LocalDataStore();

  it('retrieves seeded hospitals with default active filter', async () => {
    const hospitals = await store.getHospitals();
    assert.ok(hospitals.length > 0);
    assert.strictEqual(hospitals.every((h) => h.is_active), true);
  });

  it('filters hospitals by search keyword', async () => {
    const results = await store.getHospitals({ search: 'Charminar' });
    assert.ok(results.length > 0);
    assert.ok(results[0].name.includes('Charminar'));
  });

  it('filters hospitals by city', async () => {
    const results = await store.getHospitals({ city: 'Vijayawada' });
    assert.ok(results.length > 0);
    assert.strictEqual(results.every((h) => h.city === 'Vijayawada'), true);
  });

  it('filters hospitals by verification status', async () => {
    const verified = await store.getHospitals({ status: 'verified' });
    assert.ok(verified.length > 0);
    assert.strictEqual(verified.every((h) => h.verification_status === 'verified'), true);
  });

  it('retrieves hospital by ID with attached departments and services', async () => {
    const hosp = await store.getHospitalById('hosp-001-hyd-charminar');
    assert.ok(hosp !== null);
    assert.ok(hosp?.name.includes('Charminar'));
    assert.ok(hosp?.departments !== undefined);
    assert.ok((hosp?.departments?.length ?? 0) > 0);
  });

  it('transitions hospital verification status with notes and staff actor', async () => {
    const updated = await store.verifyHospital(
      'hosp-004-tpt-balaji',
      'verified',
      'Field survey completed by local officer.',
      'Officer Suresh (Demo)'
    );

    assert.ok(updated !== null);
    assert.strictEqual(updated?.verification_status, 'verified');

    const history = await store.getVerificationHistory('hospital', 'hosp-004-tpt-balaji');
    assert.ok(history.length > 0);
    assert.strictEqual(history[0].new_status, 'verified');
    assert.strictEqual(history[0].verified_by, 'Officer Suresh (Demo)');
  });

  it('creates a new department and links it to hospital', async () => {
    const dept = await store.createDepartment({
      hospital_id: 'hosp-001-hyd-charminar',
      name: 'Dermatology & Skin Care',
      description: 'Consultation for skin conditions and allergies.',
      contact_information: 'Room 205',
      operating_hours: 'Mon, Wed, Fri: 10:00 AM - 1:00 PM',
      is_active: true,
      verification_status: 'verified',
    });

    assert.ok(dept.id !== undefined);
    assert.strictEqual(dept.name, 'Dermatology & Skin Care');

    const depts = await store.getDepartments({ hospitalId: 'hosp-001-hyd-charminar' });
    assert.strictEqual(depts.some((d) => d.id === dept.id), true);
  });

  it('submits citizen feedback and calculates average rating', async () => {
    await store.submitFeedback({
      category: 'accessibility',
      rating: 5,
      message: 'Great Telugu voice navigation experience.',
      preferred_language: 'te',
    });

    const summary = await store.getAnalyticsSummary();
    assert.ok(summary.totalFeedback > 0);
    assert.ok(summary.averageSatisfactionRating >= 1);
    assert.ok(summary.averageSatisfactionRating <= 5);
  });

  it('records audit events for mutations without exposing secrets', async () => {
    await store.createHospital({
      name: 'Audit Test Clinic',
      slug: 'audit-test-clinic',
      description: 'Test facility',
      hospital_type: 'Primary Health Centre',
      address: 'Test Street',
      locality: 'Test Locality',
      city: 'Hyderabad',
      state: 'Telangana',
      postal_code: '500001',
      latitude: null,
      longitude: null,
      phone: null,
      email: null,
      website: null,
      operating_hours: null,
      emergency_information: null,
      is_active: true,
      verification_status: 'unverified',
    }, 'auditor-test-user');

    const auditLogs = await store.getAuditLogs();
    const testLog = auditLogs.find((l) => l.actor_user_id === 'auditor-test-user');
    assert.ok(testLog !== undefined);
    assert.strictEqual(testLog?.action, 'CREATE_HOSPITAL');
    assert.ok(testLog?.safe_metadata !== undefined);
  });
});

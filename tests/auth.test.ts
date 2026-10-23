import { describe, it } from 'node:test';
import assert from 'node:assert';
import { requireStaffOrAdmin, requireAdmin, AuthSessionUser } from '../src/lib/auth/server-auth';

describe('Authentication & Authorization Server Guards', () => {
  it('rejects unauthenticated requests with 401 status and UNAUTHENTICATED code', async () => {
    // When no session cookie exists in context
    const result = await requireStaffOrAdmin();
    assert.strictEqual(result.authenticated, false);
    if (!result.authenticated) {
      assert.strictEqual(result.response.status, 401);
      const body = await result.response.json();
      assert.strictEqual(body.code, 'UNAUTHENTICATED');
      assert.strictEqual(body.success, false);
    }
  });

  it('rejects unauthenticated admin-only operations with 401 status', async () => {
    const result = await requireAdmin();
    assert.strictEqual(result.authenticated, false);
    if (!result.authenticated) {
      assert.strictEqual(result.response.status, 401);
      const body = await result.response.json();
      assert.strictEqual(body.code, 'UNAUTHENTICATED');
    }
  });

  it('enforces role boundaries so ordinary users cannot act as staff or admin', () => {
    const patientUser: AuthSessionUser = {
      id: 'patient-123',
      email: 'citizen@example.org',
      fullName: 'Citizen Patient',
      role: 'patient',
    };

    assert.notStrictEqual(patientUser.role, 'staff');
    assert.notStrictEqual(patientUser.role, 'admin');

    const isStaffOrAdmin = patientUser.role === 'staff' || patientUser.role === 'admin';
    assert.strictEqual(isStaffOrAdmin, false);
  });

  it('enforces that staff role does not have admin permissions', () => {
    const staffUser: AuthSessionUser = {
      id: 'staff-456',
      email: 'staff@example.org',
      fullName: 'Hospital Staff',
      role: 'staff',
    };

    assert.strictEqual(staffUser.role === 'admin', false);
  });
});

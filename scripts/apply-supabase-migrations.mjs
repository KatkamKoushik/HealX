import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';
import { SEED_HOSPITALS, SEED_DEPARTMENTS, SEED_SERVICES, SEED_SOURCES } from './seed-data.mjs';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.log('NOTICE: Neither DIRECT_URL nor DATABASE_URL is set in environment.');
  console.log('To apply migrations, provide DIRECT_URL or DATABASE_URL.');
  process.exit(0);
}

const sql = postgres(connectionString, {
  ssl: 'require',
  connect_timeout: 15,
});

async function run() {
  console.log('--- 0. Dropping existing tables to align schema types ---');
  await sql.unsafe(`
    DROP TABLE IF EXISTS audit_logs CASCADE;
    DROP TABLE IF EXISTS usage_events CASCADE;
    DROP TABLE IF EXISTS notification_logs CASCADE;
    DROP TABLE IF EXISTS feedback CASCADE;
    DROP TABLE IF EXISTS verification_records CASCADE;
    DROP TABLE IF EXISTS information_sources CASCADE;
    DROP TABLE IF EXISTS services CASCADE;
    DROP TABLE IF EXISTS departments CASCADE;
    DROP TABLE IF EXISTS hospitals CASCADE;
    DROP TABLE IF EXISTS profiles CASCADE;
  `);
  console.log('✔ Dropped legacy schema successfully.');

  console.log('\n--- 1. Applying 001_initial_schema.sql ---');
  const migration1 = fs.readFileSync(path.resolve('supabase/migrations/001_initial_schema.sql'), 'utf8');
  await sql.unsafe(migration1);
  console.log('✔ Schema migration applied successfully.');

  console.log('\n--- 2. Applying 002_rls_policies.sql ---');
  const migration2 = fs.readFileSync(path.resolve('supabase/migrations/002_rls_policies.sql'), 'utf8');
  await sql.unsafe(migration2);
  console.log('✔ RLS policies migration applied successfully.');

  console.log('\n--- 3. Verifying Created Tables ---');
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  console.log('Public tables in Supabase:', tables.map(t => t.table_name).join(', '));

  console.log('\n--- 4. Seeding Hospitals ---');
  for (const h of SEED_HOSPITALS) {
    await sql`
      INSERT INTO hospitals (
        id, name, slug, description, hospital_type, address, locality, city, state, postal_code,
        latitude, longitude, phone, email, website, operating_hours, emergency_information, is_active, verification_status
      ) VALUES (
        ${h.id}, ${h.name}, ${h.slug}, ${h.description}, ${h.hospital_type}, ${h.address}, ${h.locality},
        ${h.city}, ${h.state}, ${h.postal_code}, ${h.latitude}, ${h.longitude}, ${h.phone}, ${h.email},
        ${h.website}, ${h.operating_hours}, ${h.emergency_information}, ${h.is_active}, ${h.verification_status}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        verification_status = EXCLUDED.verification_status,
        updated_at = now();
    `;
  }
  console.log(`✔ Seeded ${SEED_HOSPITALS.length} hospitals.`);

  console.log('\n--- 5. Seeding Departments ---');
  for (const d of SEED_DEPARTMENTS) {
    await sql`
      INSERT INTO departments (
        id, hospital_id, name, description, contact_information, operating_hours, is_active, verification_status
      ) VALUES (
        ${d.id}, ${d.hospital_id}, ${d.name}, ${d.description}, ${d.contact_information}, ${d.operating_hours}, ${d.is_active}, ${d.verification_status}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        verification_status = EXCLUDED.verification_status,
        updated_at = now();
    `;
  }
  console.log(`✔ Seeded ${SEED_DEPARTMENTS.length} departments.`);

  console.log('\n--- 6. Seeding Services ---');
  for (const s of SEED_SERVICES) {
    await sql`
      INSERT INTO services (
        id, department_id, name, description, service_category, eligibility_notes, is_active, verification_status
      ) VALUES (
        ${s.id}, ${s.department_id}, ${s.name}, ${s.description}, ${s.service_category}, ${s.eligibility_notes}, ${s.is_active}, ${s.verification_status}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        verification_status = EXCLUDED.verification_status,
        updated_at = now();
    `;
  }
  console.log(`✔ Seeded ${SEED_SERVICES.length} services.`);

  console.log('\n--- 7. Seeding Information Sources ---');
  for (const src of SEED_SOURCES) {
    await sql`
      INSERT INTO information_sources (
        id, hospital_id, source_name, source_type, source_reference, notes, checked_at
      ) VALUES (
        ${src.id}, ${src.hospital_id}, ${src.source_name}, ${src.source_type}, ${src.source_reference}, ${src.notes}, ${src.checked_at}
      )
      ON CONFLICT (id) DO UPDATE SET
        source_name = EXCLUDED.source_name,
        notes = EXCLUDED.notes;
    `;
  }
  console.log(`✔ Seeded ${SEED_SOURCES.length} information sources.`);

  const [hCount] = await sql`SELECT count(*)::int as count FROM hospitals;`;
  const [dCount] = await sql`SELECT count(*)::int as count FROM departments;`;
  const [sCount] = await sql`SELECT count(*)::int as count FROM services;`;
  const [srcCount] = await sql`SELECT count(*)::int as count FROM information_sources;`;

  console.log('\n=============================================================');
  console.log('  SUPABASE POSTGRESQL MIGRATION & SEED COMPLETE');
  console.log('=============================================================');
  console.log(`  Hospitals: ${hCount.count}`);
  console.log(`  Departments: ${dCount.count}`);
  console.log(`  Services: ${sCount.count}`);
  console.log(`  Information Sources: ${srcCount.count}`);
  console.log('=============================================================\n');

  await sql.end();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

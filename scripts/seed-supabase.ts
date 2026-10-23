/**
 * Standalone Supabase Seed Script
 * Can be executed to seed a newly created Supabase PostgreSQL database
 * with realistic demonstration hospitals, departments, services, and sources.
 */

import { createClient } from '@supabase/supabase-js';
import { SEED_HOSPITALS, SEED_DEPARTMENTS, SEED_SERVICES, SEED_SOURCES } from '../src/data/seed-data';

async function seed() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.trim();

  if (!url || !key) {
    console.log('NOTICE: Supabase credentials not set in environment.');
    console.log('The application will seamlessly use its in-memory demonstration repository.');
    return;
  }

  const supabase = createClient(url, key);
  console.log('Seeding Supabase database at:', url);

  // 1. Seed Hospitals
  for (const h of SEED_HOSPITALS) {
    const { error } = await supabase.from('hospitals').upsert({
      id: h.id,
      name: h.name,
      slug: h.slug,
      description: h.description,
      hospital_type: h.hospital_type,
      address: h.address,
      locality: h.locality,
      city: h.city,
      state: h.state,
      postal_code: h.postal_code,
      latitude: h.latitude,
      longitude: h.longitude,
      phone: h.phone,
      email: h.email,
      website: h.website,
      operating_hours: h.operating_hours,
      emergency_information: h.emergency_information,
      is_active: h.is_active,
      verification_status: h.verification_status,
    }, { onConflict: 'id' });

    if (error) console.error(`Error inserting hospital ${h.name}:`, error.message);
  }

  // 2. Seed Departments
  for (const d of SEED_DEPARTMENTS) {
    const { error } = await supabase.from('departments').upsert({
      id: d.id,
      hospital_id: d.hospital_id,
      name: d.name,
      description: d.description,
      contact_information: d.contact_information,
      operating_hours: d.operating_hours,
      is_active: d.is_active,
      verification_status: d.verification_status,
    }, { onConflict: 'id' });

    if (error) console.error(`Error inserting department ${d.name}:`, error.message);
  }

  // 3. Seed Services
  for (const s of SEED_SERVICES) {
    const { error } = await supabase.from('services').upsert({
      id: s.id,
      department_id: s.department_id,
      name: s.name,
      description: s.description,
      service_category: s.service_category,
      eligibility_notes: s.eligibility_notes,
      is_active: s.is_active,
      verification_status: s.verification_status,
    }, { onConflict: 'id' });

    if (error) console.error(`Error inserting service ${s.name}:`, error.message);
  }

  // 4. Seed Sources
  for (const src of SEED_SOURCES) {
    const { error } = await supabase.from('information_sources').upsert({
      id: src.id,
      hospital_id: src.hospital_id,
      source_name: src.source_name,
      source_type: src.source_type,
      source_reference: src.source_reference,
      notes: src.notes,
      checked_at: src.checked_at,
    }, { onConflict: 'id' });

    if (error) console.error(`Error inserting source ${src.source_name}:`, error.message);
  }

  console.log('Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('Seed script failed:', err);
});

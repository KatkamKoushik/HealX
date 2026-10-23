import postgres from 'postgres';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.log('No connection string available. Skipping auth user creation.');
  process.exit(0);
}

const sql = postgres(connectionString, { ssl: 'require' });

async function seedUsers() {
  console.log('Creating demo admin & staff users in Supabase Auth...');

  const users = [
    {
      email: 'admin@healx.org',
      password: 'DemoPass2026!',
      role: 'admin',
      fullName: 'System Administrator',
    },
    {
      email: 'staff@healx.org',
      password: 'DemoPass2026!',
      role: 'staff',
      fullName: 'Staff Evaluator',
    },
  ];

  for (const u of users) {
    // Check if user already exists in auth.users
    const existing = await sql`SELECT id FROM auth.users WHERE email = ${u.email}`;
    let userId;

    if (existing.length > 0) {
      userId = existing[0].id;
      console.log(`Updating existing user: ${u.email} (${userId})`);
      await sql`
        UPDATE auth.users
        SET encrypted_password = crypt(${u.password}::text, gen_salt('bf')),
            email_confirmed_at = now(),
            is_sso_user = false,
            is_anonymous = false,
            raw_app_meta_data = '{"provider":"email","providers":["email"]}',
            raw_user_meta_data = jsonb_build_object('full_name', ${u.fullName}::text),
            updated_at = now()
        WHERE id = ${userId}
      `;
    } else {
      console.log(`Inserting new user: ${u.email}`);
      const inserted = await sql`
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          is_sso_user,
          is_anonymous,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          ${u.email}::text,
          crypt(${u.password}::text, gen_salt('bf')),
          now(),
          false,
          false,
          '{"provider":"email","providers":["email"]}',
          jsonb_build_object('full_name', ${u.fullName}::text),
          now(),
          now()
        )
        RETURNING id
      `;
      userId = inserted[0].id;
    }

    // Insert or update auth.identities
    await sql`
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        ${userId},
        ${userId},
        jsonb_build_object('sub', ${userId}::text, 'email', ${u.email}::text),
        'email',
        ${userId}::text,
        now(),
        now(),
        now()
      )
      ON CONFLICT (provider, provider_id) DO UPDATE
      SET identity_data = jsonb_build_object('sub', ${userId}::text, 'email', ${u.email}::text),
          updated_at = now()
    `;

    // Upsert into public.profiles
    await sql`
      INSERT INTO public.profiles (id, full_name, role, preferred_language)
      VALUES (${userId}, ${u.fullName}, ${u.role}, 'en')
      ON CONFLICT (id) DO UPDATE
      SET full_name = ${u.fullName},
          role = ${u.role},
          updated_at = now()
    `;
    console.log(`✔ User profile configured: ${u.email} -> ${u.role}`);
  }

  await sql.end();
  console.log('✔ Auth users seeded successfully!');
}

seedUsers().catch(err => {
  console.error('Failed to seed auth users:', err);
  process.exit(1);
});

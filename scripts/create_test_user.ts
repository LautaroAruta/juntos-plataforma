import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createTestUser() {
  const email = 'test_refund@juntos.com';
  const password = 'Password123!';

  console.log(`🚀 Creando usuario ${email}...`);

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre: 'Test', apellido: 'Refund' }
  });

  if (authError) {
      console.error('❌ Error creando usuario en Auth:', authError);
      return;
  }

  console.log('✅ Usuario Auth creado:', authUser.user.id);

  // Sync with public.users
  const { error: publicError } = await supabase.from('users').insert({
      id: authUser.user.id,
      nombre: 'Test',
      apellido: 'Refund',
      email: email,
      rol: 'cliente'
  });

  if (publicError) {
      console.error('❌ Error sincronizando con public.users:', publicError);
  } else {
      console.log('✅ Sincronizado con public.users');
  }

  console.log('\n--- DATOS DEL NUEVO USUARIO ---');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('User ID:', authUser.user.id);
}

createTestUser();

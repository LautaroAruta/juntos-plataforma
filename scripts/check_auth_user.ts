import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAuthUser() {
  const email = 'test_refund@juntos.com';
  console.log(`Checking auth user for ${email}...`);

  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
      console.error('Error:', error);
      return;
  }

  const user = users.find(u => u.email === email);
  if (user) {
      console.log('User found in auth.users:');
      console.log('ID:', user.id);
  } else {
      console.log('User not found in auth.users');
  }
}

checkAuthUser();

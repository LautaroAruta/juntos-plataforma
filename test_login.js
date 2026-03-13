require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'cliente@juntos.com',
    password: 'password123',
  });
  console.log("Data:", data);
  console.log("Error:", error);
}

testLogin();

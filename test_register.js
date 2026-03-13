require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data, error } = await supabaseAdmin.auth.signUp({
    email: 'test_foo_bar_@example.com',
    password: 'password123',
    options: {
      data: {
        nombre: 'Test',
        apellido: 'Test',
        telefono: '+54 9 11 1111-1111',
        direccion: '',
        rol: 'cliente'
      },
    },
  });
  console.log("Data:", data);
  console.log("Error:", error);
}

test();

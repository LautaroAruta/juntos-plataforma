const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gvweiyfjruviqozqkwck.supabase.co';
// Trying with 'I' instead of 'l' in the signature
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdWJhc2VzZSIsInJlZiI6Imd2d2VpeWZqcnV2aXFvenFrd2NrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE3MzM4NSwiZXhwIjoyMDg4NzQ5Mzg1fQ.a3rNSIVGZi2ncQOP5T5C78DJfEZT1ur9IsPhsANheNs';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedAdmin() {
  const email = 'aruta39@gmail.com';
  const password = 'Vamosnene1@@';

  console.log(`Creating/Updating admin user: ${email}`);

  try {
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;
    
    let user = users.find(u => u.email === email);

    if (user) {
      console.log("User already exists in Auth, updating...");
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { 
          password: password,
          email_confirm: true,
          user_metadata: { nombre: 'Lautaro', apellido: 'Aruta' }
        }
      );
      if (updateError) throw updateError;
      user = updateData.user;
      console.log("User updated in Auth successfully.");
    } else {
      console.log("Creating new user in Auth...");
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nombre: 'Lautaro', apellido: 'Aruta' }
      });
      if (createError) throw createError;
      user = createData.user;
      console.log("User created in Auth successfully:", user.id);
    }

    console.log("Ensuring user exists in public.users with admin role...");
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: user.id,
        email: email,
        nombre: 'Lautaro',
        apellido: 'Aruta',
        rol: 'admin'
      }, { onConflict: 'id' });

    if (dbError) throw dbError;
    console.log("User synced to public.users with admin role.");

    console.log("\n--- CONFIGURATION COMPLETE ---");
    console.log("Email: aruta39@gmail.com");
    console.log("Rol: admin");
    console.log("------------------------------");

  } catch (err) {
    console.error("FATAL ERROR:", err.message);
    if (err.details) console.error("Details:", err.details);
  }
}

seedAdmin();

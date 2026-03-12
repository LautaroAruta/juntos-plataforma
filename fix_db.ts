import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fix() {
  const { data: providers, error: pError } = await supabase.from('providers').select('id');
  if (pError) throw pError;

  for (const provider of providers) {
    const { error: uError } = await supabase.from('users').update({ rol: 'proveedor' }).eq('id', provider.id);
    if (uError) console.error(uError);
    else console.log(`Fixed user ${provider.id}`);
  }
}

fix().catch(console.error);

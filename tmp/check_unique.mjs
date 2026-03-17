import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gvweiyfjruviqozqkwck.supabase.co/'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2d2VpeWZqcnV2aXFvenFrd2NrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE3MzM4NSwiZXhwIjoyMDg4NzQ5Mzg1fQ.a3rNSlVGZi2ncQOP5T5C78DJfEZT1ur9IsPhsANheNs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUnique() {
  const { data, error } = await supabase
    .from('products')
    .select('categoria')
  
  if (error) {
    console.error(error);
  } else {
    const unique = [...new Set(data.map(i => i.categoria))];
    console.log("Categorías únicas en DB:", unique);
  }
}

checkUnique();

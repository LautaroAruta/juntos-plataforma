import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gvweiyfjruviqozqkwck.supabase.co/'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2d2VpeWZqcnV2aXFvenFrd2NrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE3MzM4NSwiZXhwIjoyMDg4NzQ5Mzg1fQ.a3rNSlVGZi2ncQOP5T5C78DJfEZT1ur9IsPhsANheNs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrate() {
  const updates = [
    { from: 'Moda', to: 'moda' },
    { from: 'Ropa', to: 'moda' },
    { from: 'Tecnología', to: 'tecnologia' },
    { from: 'Electrónica', to: 'tecnologia' },
    { from: 'Hogar', to: 'hogar' },
    { from: 'Alimentos', to: 'alimentos' },
    { from: 'Deportes', to: 'deportes' },
    { from: 'Belleza', to: 'belleza' },
    { from: 'Juguetes', to: 'juguetes' },
  ]

  console.log("Iniciando migración de categorías...");

  for (const update of updates) {
    const { data, error } = await supabase
      .from('products')
      .update({ categoria: update.to })
      .eq('categoria', update.from)
      .select()
    
    if (error) {
      console.error(`Error actualizando ${update.from} a ${update.to}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`✅ ${update.from} -> ${update.to} (${data.length} productos)`);
    }
  }
  
  console.log("Migración finalizada.");
}

migrate().catch(console.error);

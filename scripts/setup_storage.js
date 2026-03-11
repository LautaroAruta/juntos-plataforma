const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually to avoid installing dotenv
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const envConfig = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envConfig[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabaseUrl = envConfig['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envConfig['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
  try {
    console.log("Creating 'products' bucket...");
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('products', {
      public: true,
      fileSizeLimit: 5242880, // 5MB limit
      allowedMimeTypes: ['image/jpeg', 'image/pngNative', 'image/webp']
    });
    
    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log("Bucket 'products' already exists.");
      } else {
        console.error("Error creating bucket:", bucketError);
      }
    } else {
      console.log("Bucket 'products' created successfully.");
      
      // Attempting to update bucket to ensure it's public
      await supabase.storage.updateBucket('products', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });
      console.log("Bucket publicity ensured.");
    }
  } catch (err) {
    console.error("Setup error:", err);
  }
}

setupStorage();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gvweiyfjruviqozqkwck.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdWJhc2VzZSIsInJlZiI6Imd2d2VpeWZqcnV2aXFvenFrd2NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzMzODUsImV4cCI6MjA4ODc0OTM4NX0.L1dM57pNKHUSNYRW3UIE1VHTCzRMjHYOctrLoAI4yKQ';

const supabase = createClient(supabaseUrl, anonKey);

async function testAnon() {
  console.log("Testing reachability with Anon Key...");
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.log("Response with Anon Key:", error.message);
      console.log("Status:", error.status);
    } else {
      console.log("Success with Anon Key! Database is reachable.");
    }
  } catch (err) {
    console.error("Crash:", err.message);
  }
}

testAnon();

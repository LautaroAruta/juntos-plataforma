async function testRaw() {
  const url = 'https://gvweiyfjruviqozqkwck.supabase.co/rest/v1/users?select=count';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdWJhc2VzZSIsInJlZiI6Imd2d2VpeWZqcnV2aXFvenFrd2NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzMzODUsImV4cCI6MjA4ODc0OTM4NX0.L1dM57pNKHUSNYRW3UIE1VHTCzRMjHYOctrLoAI4yKQ';

  console.log("Testing reachability with RAW FETCH...");
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Crash:", err.message);
  }
}

testRaw();

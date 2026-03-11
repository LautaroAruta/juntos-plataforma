async function testHealth() {
  const baseUrl = 'https://gvweiyfjruviqozqkwck.supabase.co';
  const endpoints = [
    '/auth/v1/health',
    '/rest/v1/',
    '/storage/v1/health'
  ];

  for (const ep of endpoints) {
    console.log(`Checking ${ep}...`);
    try {
      const res = await fetch(baseUrl + ep);
      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(`Response: ${text.substring(0, 100)}`);
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
    console.log("---");
  }
}

testHealth();

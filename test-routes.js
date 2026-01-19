const axios = require("axios");

const baseURL = "http://localhost:3001/api";

async function testRoutes() {
  console.log("Testing CMS API routes...\n");

  try {
    // Test health endpoint
    console.log("1. Testing /health:");
    const health = await axios.get(`${baseURL}/health`);
    console.log(`   Status: ${health.status}`);
    console.log(`   Response: ${JSON.stringify(health.data)}\n`);

    // Test root API endpoint
    console.log("2. Testing /api root:");
    const root = await axios.get(`${baseURL}/`);
    console.log(`   Status: ${root.status}`);
    console.log(`   Response: ${JSON.stringify(root.data)}\n`);

    // Test admin root
    console.log("3. Testing /api/admin:");
    const admin = await axios.get(`${baseURL}/admin`);
    console.log(`   Status: ${admin.status}`);
    console.log(`   Response: ${JSON.stringify(admin.data)}\n`);

    // Test documents
    console.log("4. Testing /api/documents:");
    const docs = await axios.get(`${baseURL}/documents?type=page`);
    console.log(`   Status: ${docs.status}`);
    console.log(`   Found ${docs.data.data?.length || 0} documents\n`);

    // Test content types
    console.log("5. Testing /api/content-types:");
    const cts = await axios.get(`${baseURL}/content-types`);
    console.log(`   Status: ${cts.status}`);
    console.log(`   Found ${cts.data.data?.length || 0} content types\n`);

    // Test slices
    console.log("6. Testing /api/slices:");
    const slices = await axios.get(`${baseURL}/slices`);
    console.log(`   Status: ${slices.status}`);
    console.log(`   Found ${slices.data.data?.length || 0} slices\n`);

    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("   Response status:", error.response.status);
      console.error("   Response data:", error.response.data);
    }
  }
}

testRoutes();

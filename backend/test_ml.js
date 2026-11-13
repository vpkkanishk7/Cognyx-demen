const http = require('http');

async function testDirectML() {
  console.log("1. Testing Direct FastAPI ML Microservice on port 8000...");
  try {
    const res = await fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        age: 65,
        memory_score: 85,
        pattern_score: 90,
        clock_score: 9,
        avg_reaction_time_ms: 380,
        words_per_minute: 120,
        immediate_recall_score: 4,
        pattern_matching_score: 90,
        reaction_median_ms: 380
      })
    });
    const data = await res.json();
    console.log(`[PASS] FastAPI ML Response (Status ${res.status}):`);
    console.log(`  Screening Result: ${data.screeningResult || data.diagnosis}`);
    console.log(`  Risk Tier: ${data.risk_tier || data.riskLevel}`);
    console.log(`  Impairment Probability: ${data.impairmentProbability ?? data.dementiaProbabilityPct}%`);
    console.log(`  Model Version: ${data.modelVersion}`);
  } catch (err) {
    console.log("[INFO] FastAPI ML Service is not currently running on port 8000:", err.message);
  }
}

async function testBackendMLProxy() {
  console.log("\n2. Testing Express Backend ML Proxy on port 3005 (/api/predict)...");
  try {
    const testUsername = 'mltest_' + Date.now();
    const signupRes = await fetch('http://127.0.0.1:3005/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: testUsername, password: 'password123' })
    });

    const loginRes = await fetch('http://127.0.0.1:3005/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: testUsername, password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    if (!token) {
      console.error("[FAIL] Could not authenticate test user");
      return;
    }

    const predictRes = await fetch('http://127.0.0.1:3005/api/predict', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        age: 65,
        memory_score: 85,
        pattern_score: 90,
        clock_score: 9,
        avg_reaction_time_ms: 380,
        words_per_minute: 120,
        immediate_recall_score: 4,
        pattern_matching_score: 90,
        reaction_median_ms: 380
      })
    });

    const predictData = await predictRes.json();
    console.log(`[PASS] Express Proxy ML Response (Status ${predictRes.status}):`);
    console.log(`  Screening Result: ${predictData.screeningResult || predictData.diagnosis}`);
    console.log(`  Risk Tier: ${predictData.risk_tier || predictData.riskLevel}`);
    console.log(`  Probability: ${predictData.dementiaProbabilityDisplay || predictData.dementiaProbabilityPct}`);
  } catch (err) {
    console.error("[INFO] Express Server is not currently running on port 3005:", err.message);
  }
}

async function main() {
  await testDirectML();
  await testBackendMLProxy();
}

main();

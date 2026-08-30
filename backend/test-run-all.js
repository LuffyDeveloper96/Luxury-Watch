import { execSync } from 'child_process';

const suites = [
  { name: 'Step 9 Deployment Smoke Suite', file: 'test-step9-deployment-readiness.js' },
  { name: 'Step 8 Auth Validation Suite', file: 'test-step8-auth-validation.js' },
  { name: 'Step 8 Deep Validation Suite', file: 'test-step8-deep-validation.js' },
  { name: '20 Attack Scenarios Suite', file: 'test-attack-scenarios.js' },
  { name: 'Step 6 Remediation Security Suite', file: 'test-remediation-security.js' },
  { name: 'Payment Concurrency & Lease Suite', file: 'test-payment-concurrency.js' },
  { name: 'Payment Security & HMAC Suite', file: 'test-payment-security.js' },
  { name: 'Core Security Suite', file: 'test-security.js' },
  { name: 'User Auth & 2FA Flow Suite', file: 'test-user-auth-flow.js' },
  { name: 'API Endpoints Suite', file: 'test-api.js' },
  { name: 'Full Platform Features Suite', file: 'test-full-platform.js' },
  { name: 'MongoDB Integration Suite', file: 'test-mongodb-integration.js' },
  { name: 'MongoDB Fallback Invariant Suite', file: 'test-mongodb-fallback.js' }
];

console.log('\n======================================================================');
console.log('🚀 LUXURY WATCH — COMPLETE MASTER REGRESSION & SECURITY RUN (13 SUITES)');
console.log('======================================================================\n');

let passedSuites = 0;
let failedSuites = 0;

for (const suite of suites) {
  process.stdout.write(`⏳ Running ${suite.name} (${suite.file})... `);
  try {
    const output = execSync(`node ${suite.file}`, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('✅ PASSED');
    passedSuites++;
  } catch (err) {
    console.log('❌ FAILED');
    console.error(`\n--- Output from ${suite.file} ---`);
    console.error(err.stdout || err.stderr || err.message);
    failedSuites++;
  }
  // Allow OS socket recycling on Windows
  execSync('node -e "setTimeout(() => {}, 1500)"');
}

console.log('\n======================================================================');
console.log(`📊 MASTER TEST SUMMARY: ${passedSuites} / ${suites.length} SUITES PASSED (${failedSuites} FAILED)`);
console.log('======================================================================\n');

process.exit(failedSuites > 0 ? 1 : 0);

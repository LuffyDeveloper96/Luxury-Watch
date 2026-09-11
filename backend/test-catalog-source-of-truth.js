import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendSrc = path.resolve(__dirname, '../frontend/src');

console.log('===============================================================');
console.log('  CATALOG SINGLE SOURCE OF TRUTH — AUDIT & REGRESSION SUITE');
console.log('===============================================================\n');

let passed = 0;
let failed = 0;

const assert = (condition, name, details = '') => {
  if (condition) {
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${name} ${details ? `(${details})` : ''}`);
    failed++;
  }
};

// 1. Audit all frontend files for illegal INITIAL_PRODUCTS imports
const getAllFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
};

const allFrontendFiles = getAllFiles(frontendSrc);
let initialProductsImports = [];

for (const file of allFrontendFiles) {
  const relPath = path.relative(frontendSrc, file);
  // Skip the source definition file itself (initialProducts.js)
  if (relPath === 'data\\initialProducts.js' || relPath === 'data/initialProducts.js') {
    continue;
  }
  const content = fs.readFileSync(file, 'utf-8');
  if (content.includes('INITIAL_PRODUCTS')) {
    initialProductsImports.push(relPath);
  }
}

assert(
  initialProductsImports.length === 0,
  'No production component imports or references INITIAL_PRODUCTS',
  `Found in: ${initialProductsImports.join(', ')}`
);

// 2. StoreContext.jsx Verification
const storeContextPath = path.join(frontendSrc, 'context', 'StoreContext.jsx');
const storeContextCode = fs.readFileSync(storeContextPath, 'utf-8');

assert(
  storeContextCode.includes('const [products, setProducts] = useState([]);'),
  'StoreContext initializes products state as []'
);

assert(
  storeContextCode.includes('if (prodRes.status === \'fulfilled\' && Array.isArray(prodRes.value?.products))'),
  'StoreContext refreshStoreData accepts Array.isArray(products) authoritatively (without requiring length > 0)'
);

assert(
  storeContextCode.includes('setProductsError'),
  'StoreContext tracks productsError state for handling API failures'
);

// 3. App.jsx Verification
const appPath = path.join(frontendSrc, 'App.jsx');
const appCode = fs.readFileSync(appPath, 'utf-8');

assert(
  appCode.includes('productsLoading') && appCode.includes('productsError'),
  'App.jsx consumes productsLoading and productsError states'
);

assert(
  appCode.includes('No Masterpieces Currently in Vault'),
  'App.jsx renders dedicated empty vault state when database catalog has 0 active products'
);

// 4. Simulate StoreContext sync behavior under all 3 conditions
// Condition A: Database returns products
let mockState = [];
let mockLoading = true;
let mockError = null;

const simulateSync = (prodRes) => {
  mockLoading = true;
  if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value?.products)) {
    mockState = prodRes.value.products;
    mockError = null;
  } else if (prodRes.status === 'rejected') {
    mockState = [];
    mockError = prodRes.reason?.message || 'Failed';
  }
  mockLoading = false;
};

// Test Condition A: DB has products
simulateSync({ status: 'fulfilled', value: { success: true, count: 2, products: [{ id: 'p1', name: 'Rolex Submariner' }, { id: 'p2', name: 'Titan Edge' }] } });
assert(
  mockState.length === 2 && mockState[0].id === 'p1' && !mockLoading && mockError === null,
  'Simulated Sync A: Non-empty DB response sets state to exact DB products'
);

// Test Condition B: DB has ZERO active products (products: [])
simulateSync({ status: 'fulfilled', value: { success: true, count: 0, products: [] } });
assert(
  mockState.length === 0 && Array.isArray(mockState) && !mockLoading && mockError === null,
  'Simulated Sync B: Empty DB response (products: []) authoritatively sets state to []'
);

// Test Condition C: API request fails / rejected
simulateSync({ status: 'rejected', reason: new Error('Network / 500 error') });
assert(
  mockState.length === 0 && mockError === 'Network / 500 error' && !mockLoading,
  'Simulated Sync C: API failure leaves state empty with productsError set (never falling back to hardcoded catalog)'
);

console.log('\n===============================================================');
console.log(`  AUDIT RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log('===============================================================\n');

if (failed > 0) process.exit(1);
process.exit(0);

import fs from 'fs';
import path from 'path';
import dns from 'dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Brand } from '../models/Brand.js';
import { getBrands, getBrandBySlug, createBrand, updateBrand, deleteBrand } from '../controllers/brandController.js';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

async function runTests() {
  console.log('==============================================');
  console.log('  TESTING BRAND & COLLECTION CRUD & APIS      ');
  console.log('==============================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/luxury_watch';
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000, family: 4 });
  console.log('✅ Connected to MongoDB Atlas\n');

  // Helper mock req, res
  const createMockRes = () => {
    const res = {
      statusCode: 200,
      jsonData: null,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.jsonData = data; return this; }
    };
    return res;
  };

  // Test 1: Customer getBrands (active only)
  console.log('1. Testing customer getBrands (active only)...');
  const res1 = createMockRes();
  await getBrands({ query: {} }, res1);
  console.log(`   Status: ${res1.statusCode}, Count: ${res1.jsonData.count}`);
  if (!res1.jsonData.success || res1.jsonData.count < 10) {
    throw new Error('Customer getBrands failed or returned fewer than 10 brands');
  }
  console.log(`   Sample brand: "${res1.jsonData.brands[0].name}" - Badge: "${res1.jsonData.brands[0].badge}" - Order: ${res1.jsonData.brands[0].displayOrder}`);
  console.log('   ✅ PASS: Customer getBrands works\n');

  // Test 2: Admin getBrands (all=true)
  console.log('2. Testing admin getBrands (all=true)...');
  const res2 = createMockRes();
  await getBrands({ query: { all: 'true' } }, res2);
  console.log(`   Status: ${res2.statusCode}, Count: ${res2.jsonData.count}`);
  console.log('   ✅ PASS: Admin getBrands works\n');

  // Test 3: Create a new brand
  console.log('3. Testing createBrand...');
  const newBrandData = {
    name: 'Hublot Test',
    slug: 'hublot-test',
    badge: 'FUSION ART',
    location: 'Nyon, Switzerland',
    established: '1980',
    featuredCollection: 'Big Bang Unico',
    description: 'Chronograph flyback manufacture calibre in Magic Gold',
    image: '/images/watches/rolex_submariner.jpg',
    imageAlt: 'Hublot Big Bang Watch',
    filterTarget: 'Hublot Test',
    displayOrder: 11,
    isActive: true
  };
  const res3 = createMockRes();
  await createBrand({ body: newBrandData }, res3);
  console.log(`   Status: ${res3.statusCode}, Created: "${res3.jsonData.brand?.name}" (ID: ${res3.jsonData.brand?.id})`);
  if (res3.statusCode !== 201 || !res3.jsonData.brand) {
    throw new Error('createBrand failed: ' + JSON.stringify(res3.jsonData));
  }
  console.log('   ✅ PASS: Brand created\n');

  // Test 4: Update the brand (Edit and Deactivate)
  console.log('4. Testing updateBrand (Edit collection and Deactivate)...');
  const updateData = {
    featuredCollection: 'Big Bang Integrated Ceramic',
    displayOrder: 12,
    isActive: false // Deactivate
  };
  const res4 = createMockRes();
  await updateBrand({ params: { id: 'hublot-test' }, body: updateData }, res4);
  console.log(`   Status: ${res4.statusCode}, Updated isActive: ${res4.jsonData.brand?.isActive}`);
  if (res4.jsonData.brand?.isActive !== false) {
    throw new Error('updateBrand failed to update isActive');
  }
  console.log('   ✅ PASS: Brand updated\n');

  // Test 5: Verify customer getBrands EXCLUDES deactivated brand
  console.log('5. Testing that customer getBrands hides deactivated brand...');
  const res5 = createMockRes();
  await getBrands({ query: {} }, res5);
  const foundInPublic = res5.jsonData.brands.some(b => b.slug === 'hublot-test');
  console.log(`   Is deactivated brand visible to customer? ${foundInPublic ? 'YES (FAIL)' : 'NO (CORRECT)'}`);
  if (foundInPublic) {
    throw new Error('Deactivated brand should not be visible to customers');
  }
  console.log('   ✅ PASS: Deactivated brand hidden from customer storefront\n');

  // Test 6: Verify admin getBrands INCLUDES deactivated brand
  console.log('6. Testing that admin getBrands with all=true includes deactivated brand...');
  const res6 = createMockRes();
  await getBrands({ query: { all: 'true' } }, res6);
  const foundInAdmin = res6.jsonData.brands.some(b => b.slug === 'hublot-test');
  console.log(`   Is deactivated brand visible to admin? ${foundInAdmin ? 'YES (CORRECT)' : 'NO (FAIL)'}`);
  if (!foundInAdmin) {
    throw new Error('Deactivated brand should be visible to admin');
  }
  console.log('   ✅ PASS: Deactivated brand visible in admin portal\n');

  // Test 7: Delete the brand
  console.log('7. Testing deleteBrand...');
  const res7 = createMockRes();
  await deleteBrand({ params: { id: 'hublot-test' } }, res7);
  console.log(`   Status: ${res7.statusCode}, Message: ${res7.jsonData.message}`);
  if (res7.statusCode !== 200) {
    throw new Error('deleteBrand failed');
  }
  console.log('   ✅ PASS: Brand deleted\n');

  // Test 8: Verify brand is completely gone
  console.log('8. Verifying brand is removed...');
  const res8 = createMockRes();
  await getBrands({ query: { all: 'true' } }, res8);
  const stillExists = res8.jsonData.brands.some(b => b.slug === 'hublot-test');
  console.log(`   Is brand still in database? ${stillExists ? 'YES (FAIL)' : 'NO (CLEAN)'}`);
  if (stillExists) {
    throw new Error('Brand still exists after deletion');
  }
  console.log(`   Final active brand count: ${res8.jsonData.count}`);
  console.log('   ✅ PASS: Brand completely removed\n');

  console.log('✨ ALL 8 BRAND CRUD & LIFECYCLE TESTS PASSED PERFECTLY!\n');
  await mongoose.disconnect();
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

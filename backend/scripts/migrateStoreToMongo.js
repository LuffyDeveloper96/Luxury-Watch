import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import {
  User,
  Product,
  Brand,
  Category,
  Order,
  Cart,
  Coupon,
  Review,
  Payment,
  StoreSettings,
  HomepageContent,
  Return,
  ActivityLog,
  Contact
} from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_JSON_PATH = path.resolve(__dirname, '../data/store.json');

async function migrateStoreToMongo(customUri) {
  const uri = customUri || env.MONGODB_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/luxurywatch';
  const maskedUri = uri.replace(/:([^:@]+)@/, ':***@');

  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   LUXURY WATCH — IDEMPOTENT MONGODB DATA MIGRATION ENGINE    ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(STORE_JSON_PATH)) {
    console.error(`❌ [Migration Error] Source store.json file not found at: ${STORE_JSON_PATH}`);
    process.exit(1);
  }

  let storeData;
  try {
    const raw = fs.readFileSync(STORE_JSON_PATH, 'utf-8');
    storeData = JSON.parse(raw);
    console.log(`📖 Successfully read store.json (${raw.length} bytes)`);
  } catch (err) {
    console.error(`❌ [Migration Error] Failed to parse store.json: ${err.message}`);
    process.exit(1);
  }

  console.log(`🔌 Connecting to MongoDB: ${maskedUri}...`);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log(`✅ Connected to MongoDB cluster! Database: "${mongoose.connection.name}"\n`);
  } catch (err) {
    console.error(`❌ [Migration Connection Failed]: ${err.message}`);
    process.exit(1);
  }

  // Ensure collection indexes are synced cleanly
  try {
    await Promise.all([
      User.syncIndexes().catch(() => {}),
      Product.syncIndexes().catch(() => {}),
      Brand.syncIndexes().catch(() => {}),
      Category.syncIndexes().catch(() => {}),
      Order.syncIndexes().catch(() => {}),
      Cart.syncIndexes().catch(() => {}),
      Coupon.syncIndexes().catch(() => {}),
      Review.syncIndexes().catch(() => {}),
      Payment.syncIndexes().catch(() => {}),
      StoreSettings.syncIndexes().catch(() => {}),
      HomepageContent.syncIndexes().catch(() => {}),
      Return.syncIndexes().catch(() => {}),
      ActivityLog.syncIndexes().catch(() => {}),
      Contact.syncIndexes().catch(() => {})
    ]);
  } catch (e) {
    // Indexes sync note
  }

  const results = {
    brands: { total: 0, upserted: 0, errors: 0 },
    categories: { total: 0, upserted: 0, errors: 0 },
    products: { total: 0, upserted: 0, errors: 0 },
    coupons: { total: 0, upserted: 0, errors: 0 },
    reviews: { total: 0, upserted: 0, errors: 0 },
    users: { total: 0, upserted: 0, errors: 0 },
    orders: { total: 0, upserted: 0, errors: 0 },
    payments: { total: 0, upserted: 0, errors: 0 },
    storeSettings: { total: 0, upserted: 0, errors: 0 },
    homepageContent: { total: 0, upserted: 0, errors: 0 },
    returns: { total: 0, upserted: 0, errors: 0 },
    activityLog: { total: 0, upserted: 0, errors: 0 },
    contacts: { total: 0, upserted: 0, errors: 0 }
  };

  try {
    // 1. Brands
    if (Array.isArray(storeData.brands)) {
      results.brands.total = storeData.brands.length;
      for (const brand of storeData.brands) {
        try {
          const filter = { $or: [{ id: brand.id }, { slug: brand.slug }, { name: brand.name }] };
          await Brand.findOneAndUpdate(filter, { $set: brand }, { upsert: true, returnDocument: 'after' });
          results.brands.upserted++;
        } catch (e) {
          results.brands.errors++;
          console.warn(`   ⚠️ Brand error [${brand.name}]: ${e.message}`);
        }
      }
    }

    // 2. Categories
    if (Array.isArray(storeData.categories)) {
      results.categories.total = storeData.categories.length;
      for (const cat of storeData.categories) {
        try {
          const filter = { $or: [{ id: cat.id }, { slug: cat.slug }, { name: cat.name }] };
          await Category.findOneAndUpdate(filter, { $set: cat }, { upsert: true, returnDocument: 'after' });
          results.categories.upserted++;
        } catch (e) {
          results.categories.errors++;
          console.warn(`   ⚠️ Category error [${cat.name}]: ${e.message}`);
        }
      }
    }

    // 3. Products
    if (Array.isArray(storeData.products)) {
      results.products.total = storeData.products.length;
      for (const prod of storeData.products) {
        try {
          const filter = { $or: [{ id: prod.id }, { sku: prod.sku }, { slug: prod.slug }] };
          await Product.findOneAndUpdate(filter, { $set: prod }, { upsert: true, returnDocument: 'after' });
          results.products.upserted++;
        } catch (e) {
          results.products.errors++;
          console.warn(`   ⚠️ Product error [${prod.name}]: ${e.message}`);
        }
      }
    }

    // 4. Coupons
    if (Array.isArray(storeData.coupons)) {
      results.coupons.total = storeData.coupons.length;
      for (const coupon of storeData.coupons) {
        try {
          const filter = { code: coupon.code.toUpperCase() };
          await Coupon.findOneAndUpdate(filter, { $set: { ...coupon, code: coupon.code.toUpperCase() } }, { upsert: true, returnDocument: 'after' });
          results.coupons.upserted++;
        } catch (e) {
          results.coupons.errors++;
          console.warn(`   ⚠️ Coupon error [${coupon.code}]: ${e.message}`);
        }
      }
    }

    // 5. Reviews
    if (Array.isArray(storeData.reviews)) {
      results.reviews.total = storeData.reviews.length;
      for (const review of storeData.reviews) {
        try {
          const filter = { id: review.id };
          await Review.findOneAndUpdate(filter, { $set: review }, { upsert: true, returnDocument: 'after' });
          results.reviews.upserted++;
        } catch (e) {
          results.reviews.errors++;
          console.warn(`   ⚠️ Review error [${review.id}]: ${e.message}`);
        }
      }
    }

    // 6. Users (Preserving password hashes and addresses safely, never logging passwords)
    if (Array.isArray(storeData.users)) {
      results.users.total = storeData.users.length;
      for (const user of storeData.users) {
        try {
          const cleanEmail = (user.email || '').toLowerCase().trim();
          const filter = { email: cleanEmail };
          await User.findOneAndUpdate(filter, { $set: { ...user, email: cleanEmail } }, { upsert: true, returnDocument: 'after' });
          results.users.upserted++;
        } catch (e) {
          results.users.errors++;
          console.warn(`   ⚠️ User error [${user.email}]: ${e.message}`);
        }
      }
    }

    // 7. Orders
    if (Array.isArray(storeData.orders)) {
      results.orders.total = storeData.orders.length;
      for (const order of storeData.orders) {
        try {
          const filter = { id: order.id };
          const orderToSave = {
            ...order,
            orderNumber: order.orderNumber || order.id
          };
          await Order.findOneAndUpdate(filter, { $set: orderToSave }, { upsert: true, returnDocument: 'after' });
          results.orders.upserted++;
        } catch (e) {
          results.orders.errors++;
          console.warn(`   ⚠️ Order error [${order.id}]: ${e.message}`);
        }
      }
    }

    // 8. Payments
    if (Array.isArray(storeData.payments)) {
      results.payments.total = storeData.payments.length;
      for (const payment of storeData.payments) {
        try {
          const txnId = payment.transactionId || `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
          const filter = { transactionId: txnId };
          await Payment.findOneAndUpdate(filter, { $set: { ...payment, transactionId: txnId } }, { upsert: true, returnDocument: 'after' });
          results.payments.upserted++;
        } catch (e) {
          results.payments.errors++;
          console.warn(`   ⚠️ Payment error [${payment.transactionId}]: ${e.message}`);
        }
      }
    }

    // 9. Store Settings (Excluding admin auth credentials)
    if (storeData.storeSettings) {
      results.storeSettings.total = 1;
      try {
        const settingsToSave = { ...storeData.storeSettings };
        delete settingsToSave.adminEmail;
        delete settingsToSave.adminPassword;
        delete settingsToSave.adminPasswordHash;
        delete settingsToSave.authorizedAdminGmail;
        await StoreSettings.findOneAndUpdate(
          { key: 'global_settings' },
          { $set: settingsToSave },
          { upsert: true, returnDocument: 'after' }
        );
        results.storeSettings.upserted = 1;
      } catch (e) {
        results.storeSettings.errors = 1;
        console.warn(`   ⚠️ StoreSettings error: ${e.message}`);
      }
    }

    // 10. Homepage Content CMS
    if (storeData.homepageContent) {
      results.homepageContent.total = 1;
      try {
        await HomepageContent.findOneAndUpdate(
          { key: 'homepage_cms' },
          { $set: storeData.homepageContent },
          { upsert: true, returnDocument: 'after' }
        );
        results.homepageContent.upserted = 1;
      } catch (e) {
        results.homepageContent.errors = 1;
        console.warn(`   ⚠️ HomepageContent error: ${e.message}`);
      }
    }

    // 11. Returns
    if (Array.isArray(storeData.returns)) {
      results.returns.total = storeData.returns.length;
      for (const ret of storeData.returns) {
        try {
          const filter = { id: ret.id };
          await Return.findOneAndUpdate(filter, { $set: ret }, { upsert: true, returnDocument: 'after' });
          results.returns.upserted++;
        } catch (e) {
          results.returns.errors++;
          console.warn(`   ⚠️ Return error [${ret.id}]: ${e.message}`);
        }
      }
    }

    // 12. Activity Log
    if (Array.isArray(storeData.activityLog)) {
      results.activityLog.total = storeData.activityLog.length;
      for (const act of storeData.activityLog) {
        try {
          const filter = { id: act.id };
          await ActivityLog.findOneAndUpdate(filter, { $set: act }, { upsert: true, returnDocument: 'after' });
          results.activityLog.upserted++;
        } catch (e) {
          results.activityLog.errors++;
          console.warn(`   ⚠️ ActivityLog error [${act.id}]: ${e.message}`);
        }
      }
    }

    // 13. Contacts
    if (Array.isArray(storeData.contacts)) {
      results.contacts.total = storeData.contacts.length;
      for (const cnt of storeData.contacts) {
        try {
          const filter = { id: cnt.id };
          await Contact.findOneAndUpdate(filter, { $set: cnt }, { upsert: true, returnDocument: 'after' });
          results.contacts.upserted++;
        } catch (e) {
          results.contacts.errors++;
          console.warn(`   ⚠️ Contact error [${cnt.id}]: ${e.message}`);
        }
      }
    }

    console.log('===============================================================');
    console.log('📊 MIGRATION SUMMARY:');
    console.log('===============================================================');
    let totalRecords = 0;
    let totalUpserted = 0;
    let totalErrors = 0;

    for (const [collection, stats] of Object.entries(results)) {
      console.log(`  • ${collection.padEnd(18)}: ${String(stats.upserted).padStart(3)} / ${String(stats.total).padStart(3)} upserted (${stats.errors} errors)`);
      totalRecords += stats.total;
      totalUpserted += stats.upserted;
      totalErrors += stats.errors;
    }

    console.log('---------------------------------------------------------------');
    console.log(`  TOTAL RECORDS PROCESSED : ${totalRecords}`);
    console.log(`  TOTAL RECORDS UPSERTED  : ${totalUpserted}`);
    console.log(`  TOTAL ERRORS            : ${totalErrors}`);
    console.log('===============================================================');
    console.log('🔒 store.json preserved safely at:', STORE_JSON_PATH);
    console.log('✅ Migration to MongoDB completed successfully!\n');

    return results;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

// Run directly if invoked from CLI
if (process.argv[1] && process.argv[1].endsWith('migrateStoreToMongo.js')) {
  const customUriArg = process.argv[2];
  migrateStoreToMongo(customUriArg).then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('Fatal migration error:', err);
    process.exit(1);
  });
}

export default migrateStoreToMongo;

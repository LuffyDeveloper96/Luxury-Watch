import fs from 'fs';
import path from 'path';
import dns from 'dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Brand } from '../models/Brand.js';

// Resolve DNS for MongoDB Atlas on Windows environments
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore if not permitted
}

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

const STORE_JSON_PATH = path.resolve(process.cwd(), 'backend/data/store.json');

export const SEED_BRANDS = [
  {
    id: 'rolex',
    name: 'ROLEX',
    slug: 'rolex',
    badge: 'OFFICIAL ICON',
    tag: 'OFFICIAL ICON',
    location: 'Geneva, Switzerland',
    established: '1905',
    origin: 'Geneva, Switzerland • Est. 1905',
    founded: '1905',
    featuredCollection: 'Submariner & Daytona Panda',
    model: 'Submariner & Daytona Panda',
    description: 'Legendary 904L Oystersteel architecture with Cerachrom ceramic bezel & Superlative Chronometer',
    subtitle: 'Legendary 904L Oystersteel architecture with Cerachrom ceramic bezel & Superlative Chronometer',
    image: '/images/watches/rolex_submariner.jpg',
    imageAlt: 'Rolex Submariner & Daytona Panda Luxury Watch',
    filterTarget: 'Rolex',
    accentColor: '#006039',
    color: '#006039',
    goldAccent: '#d4af37',
    displayOrder: 1,
    isFeatured: true,
    active: true,
    isActive: true
  },
  {
    id: 'titan',
    name: 'TITAN',
    slug: 'titan',
    badge: 'INDIAN ICON',
    tag: 'INDIAN ICON',
    location: 'Hosur, India',
    established: '1984',
    origin: 'Hosur, India • Est. 1984',
    founded: '1984',
    featuredCollection: 'Grandmaster Automatic & Edge Ceramic',
    model: 'Grandmaster Automatic & Edge Ceramic',
    description: 'Open-heart exhibition mechanical calibres, 3.8mm ultra-slim ceramic and Swarovski Raga collection',
    subtitle: 'Open-heart exhibition mechanical calibres, 3.8mm ultra-slim ceramic and Swarovski Raga collection',
    image: '/images/watches/titan_grandmaster.jpg',
    imageAlt: 'Titan Grandmaster Automatic Watch',
    filterTarget: 'Titan',
    accentColor: '#8a6709',
    color: '#8a6709',
    goldAccent: '#d4af37',
    displayOrder: 2,
    isFeatured: true,
    active: true,
    isActive: true
  },
  {
    id: 'casio',
    name: 'CASIO',
    slug: 'casio',
    badge: 'TOUGH PRECISION',
    tag: 'TOUGH PRECISION',
    location: 'Tokyo, Japan',
    established: '1946',
    origin: 'Tokyo, Japan • Est. 1946',
    founded: '1946',
    featuredCollection: "G-Shock 'CasiOak' & Edifice Solar",
    model: "G-Shock 'CasiOak' & Edifice Solar",
    description: 'Indestructible 200M Carbon Core Guard steel, solar sapphire chronograph & iconic 1980s retro digital',
    subtitle: 'Indestructible 200M Carbon Core Guard steel, solar sapphire chronograph & iconic 1980s retro digital',
    image: '/images/watches/casio_gshock.jpg',
    imageAlt: 'Casio G-Shock and Edifice Watch',
    filterTarget: 'Casio',
    accentColor: '#1e293b',
    color: '#1e293b',
    goldAccent: '#d4af37',
    displayOrder: 3,
    isFeatured: true,
    active: true,
    isActive: true
  },
  {
    id: 'fastrack',
    name: 'FASTRACK',
    slug: 'fastrack',
    badge: 'YOUTH ICON',
    tag: 'YOUTH ICON',
    location: 'Bangalore, India',
    established: '1998',
    origin: 'Bangalore, India • Est. 1998',
    founded: '1998',
    featuredCollection: 'Stunners Chrono & Reflex AMOLED',
    model: 'Stunners Chrono & Reflex AMOLED',
    description: 'Edgy youth expression, bold multi-function sub-dials, curved AMOLED smartwatches & sport bands',
    subtitle: 'Edgy youth expression, bold multi-function sub-dials, curved AMOLED smartwatches & sport bands',
    image: '/images/watches/fastrack_stunners.jpg',
    imageAlt: 'Fastrack Stunners Chrono Watch',
    filterTarget: 'Fastrack',
    accentColor: '#e11d48',
    color: '#e11d48',
    goldAccent: '#d4af37',
    displayOrder: 4,
    isFeatured: true,
    active: true,
    isActive: true
  },
  {
    id: 'fossil',
    name: 'FOSSIL',
    slug: 'fossil',
    badge: 'VINTAGE AMERICANA',
    tag: 'VINTAGE AMERICANA',
    location: 'Texas, USA',
    established: '1984',
    origin: 'Texas, USA • Est. 1984',
    founded: '1984',
    featuredCollection: 'Townsman Skeleton & Grant Chrono',
    model: 'Townsman Skeleton & Grant Chrono',
    description: 'Exhibition mechanical gear trains, amber crystal accents, Roman numerals & saddle brown leather',
    subtitle: 'Exhibition mechanical gear trains, amber crystal accents, Roman numerals & saddle brown leather',
    image: '/images/watches/fossil_townsman.jpg',
    imageAlt: 'Fossil Townsman Skeleton Watch',
    filterTarget: 'Fossil',
    accentColor: '#78350f',
    color: '#78350f',
    goldAccent: '#d4af37',
    displayOrder: 5,
    isFeatured: true,
    active: true,
    isActive: true
  },
  {
    id: 'timex',
    name: 'TIMEX',
    slug: 'timex',
    badge: 'HERITAGE 1854',
    tag: 'HERITAGE 1854',
    location: 'Connecticut, USA',
    established: '1854',
    origin: 'Connecticut, USA • Est. 1854',
    founded: '1854',
    featuredCollection: 'Q Reissue 1979 Diver & Marlin',
    model: 'Q Reissue 1979 Diver & Marlin',
    description: 'Legendary 1979 diver reissue with rotating Pepsi bezel, woven steel mesh & 21-jewel automatic Marlin',
    subtitle: 'Legendary 1979 diver reissue with rotating Pepsi bezel, woven steel mesh & 21-jewel automatic Marlin',
    image: '/images/watches/timex_q.jpg',
    imageAlt: 'Timex Q Reissue 1979 Watch',
    filterTarget: 'Timex',
    accentColor: '#0369a1',
    color: '#0369a1',
    goldAccent: '#d4af37',
    displayOrder: 6,
    isFeatured: true,
    active: true,
    isActive: true
  },
  {
    id: 'sonata',
    name: 'SONATA',
    slug: 'sonata',
    badge: 'TATA TRUST',
    tag: 'TATA TRUST',
    location: 'Tata Group, India',
    established: '1997',
    origin: 'Tata Group, India • Est. 1997',
    founded: '1997',
    featuredCollection: 'Poze Dual Tone & Utsav Wedding',
    model: 'Poze Dual Tone & Utsav Wedding',
    description: 'Fluted gold bezels, champagne sunray dials, day-date calendar and traditional carved filigree jewellery',
    subtitle: 'Fluted gold bezels, champagne sunray dials, day-date calendar and traditional carved filigree jewellery',
    image: '/images/watches/sonata_poze.jpg',
    imageAlt: 'Sonata Poze Watch',
    filterTarget: 'Sonata',
    accentColor: '#b45309',
    color: '#b45309',
    goldAccent: '#d4af37',
    displayOrder: 7,
    isFeatured: true,
    active: true,
    isActive: true
  },
  {
    id: 'guess',
    name: 'GUESS',
    slug: 'guess',
    badge: 'RUNWAY GLAMOUR',
    tag: 'RUNWAY GLAMOUR',
    location: 'Los Angeles, USA',
    established: '1981',
    origin: 'Los Angeles, USA • Est. 1981',
    founded: '1981',
    featuredCollection: 'Frontier Pavé Crystal & Phoenix',
    model: 'Frontier Pavé Crystal & Phoenix',
    description: 'Dazzling hundreds of iced-out pavé crystals, gold multifunction dials & curved tonneau barrel skeletons',
    subtitle: 'Dazzling hundreds of iced-out pavé crystals, gold multifunction dials & curved tonneau barrel skeletons',
    image: '/images/watches/guess_frontier.jpg',
    imageAlt: 'Guess Frontier Watch',
    filterTarget: 'Guess',
    accentColor: '#4c1d95',
    color: '#4c1d95',
    goldAccent: '#d4af37',
    displayOrder: 8,
    isFeatured: true,
    active: true,
    isActive: true
  },
  {
    id: 'limestone',
    name: 'LIMESTONE',
    slug: 'limestone',
    badge: 'CONTEMPORARY',
    tag: 'CONTEMPORARY',
    location: 'New Delhi, India',
    established: '2018',
    origin: 'New Delhi, India • Est. 2018',
    founded: '2018',
    featuredCollection: 'Diamond-Cut Glass & Chrono Look',
    model: 'Diamond-Cut Glass & Chrono Look',
    description: 'Prismatic faceted 3D geometric glass, magnetic Milanese mesh straps & emerald sunburst business dials',
    subtitle: 'Prismatic faceted 3D geometric glass, magnetic Milanese mesh straps & emerald sunburst business dials',
    image: '/images/watches/limestone_diamond.jpg',
    imageAlt: 'Limestone Diamond-Cut Watch',
    filterTarget: 'Limestone',
    accentColor: '#0f172a',
    color: '#0f172a',
    goldAccent: '#d4af37',
    displayOrder: 9,
    isFeatured: true,
    active: true,
    isActive: true
  },
  {
    id: 'noise',
    name: 'NOISE',
    slug: 'noise',
    badge: 'SMART WEARABLE',
    tag: 'SMART WEARABLE',
    location: 'Gurugram, India',
    established: '2014',
    origin: 'Gurugram, India • Est. 2014',
    founded: '2014',
    featuredCollection: 'ColorFit Pro 5 Max & Diva Diamond',
    model: 'ColorFit Pro 5 Max & Diva Diamond',
    description: '1.96-inch HD AMOLED displays, metallic chassis, Bluetooth calling, diamond-cut bezels & metal mesh',
    subtitle: '1.96-inch HD AMOLED displays, metallic chassis, Bluetooth calling, diamond-cut bezels & metal mesh',
    image: '/images/watches/noise_colorfit.jpg',
    imageAlt: 'Noise ColorFit Watch',
    filterTarget: 'Noise',
    accentColor: '#0284c7',
    color: '#0284c7',
    goldAccent: '#d4af37',
    displayOrder: 10,
    isFeatured: true,
    active: true,
    isActive: true
  }
];

async function seedBrands() {
  console.log('====================================================');
  console.log('  LUXURY WATCH — IDEMPOTENT BRANDS & COLLECTIONS SEEDER');
  console.log('====================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/luxury_watch';
  const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
  console.log(`🔌 Connecting to MongoDB: ${maskedUri}...`);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      family: 4
    });
    console.log(`✅ Connected to MongoDB database: "${mongoose.connection.name}"`);

    let addedCount = 0;
    let updatedCount = 0;

    for (const brandData of SEED_BRANDS) {
      const existing = await Brand.findOne({
        $or: [{ id: brandData.id }, { slug: brandData.slug }]
      });

      if (!existing) {
        await Brand.create(brandData);
        addedCount++;
      } else {
        // Update to make sure all new fields (badge, location, established, featuredCollection, etc.) are present
        await Brand.updateOne({ _id: existing._id }, { $set: brandData });
        updatedCount++;
      }
    }

    const totalBrands = await Brand.countDocuments();
    console.log(`📊 MongoDB Brands State: ${addedCount} added, ${updatedCount} updated (Total in DB: ${totalBrands})`);

    // Sync to store.json
    try {
      if (fs.existsSync(STORE_JSON_PATH)) {
        const storeData = JSON.parse(fs.readFileSync(STORE_JSON_PATH, 'utf-8'));
        storeData.brands = SEED_BRANDS;
        fs.writeFileSync(STORE_JSON_PATH, JSON.stringify(storeData, null, 2), 'utf-8');
        console.log(`📁 Synced to store.json: 10 brands written (Total in store.json: ${storeData.brands.length})`);
      }
    } catch (e) {
      console.warn('Could not sync to store.json:', e.message);
    }

    console.log('\n✨ Brand seeding completed successfully!');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedBrands();

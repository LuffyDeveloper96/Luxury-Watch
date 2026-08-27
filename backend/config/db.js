import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import mongoose from 'mongoose';

// Fix Windows SRV DNS resolution for MongoDB Atlas if needed
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if cannot override DNS servers
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial High-End Seed Data for Luxury Watch
export const INITIAL_SEED = {
  brands: [
    {
      id: 'rolex',
      name: 'Rolex',
      slug: 'rolex',
      tagline: 'A Crown for Every Achievement',
      origin: 'Geneva, Switzerland',
      founded: '1905',
      hallmark: 'Oyster Perpetual, Cosmograph Daytona & Submariner',
      color: '#006039',
      goldAccent: '#d4af37',
      displayOrder: 1,
      isFeatured: true,
      active: true
    },
    {
      id: 'titan',
      name: 'Titan',
      slug: 'titan',
      tagline: 'Be More • Timeless Indian Craftsmanship',
      origin: 'Hosur, India',
      founded: '1984',
      hallmark: 'Grandmaster Automatic, Edge Ceramic & Raga Collection',
      color: '#8a6709',
      goldAccent: '#d4af37',
      displayOrder: 2,
      isFeatured: true,
      active: true
    },
    {
      id: 'casio',
      name: 'Casio',
      slug: 'casio',
      tagline: 'Calculated Precision & Toughness',
      origin: 'Tokyo, Japan',
      founded: '1946',
      hallmark: 'G-Shock CasiOak, Edifice Solar & Vintage Digital',
      color: '#1e293b',
      goldAccent: '#d4af37',
      displayOrder: 3,
      isFeatured: true,
      active: true
    },
    {
      id: 'fastrack',
      name: 'Fastrack',
      slug: 'fastrack',
      tagline: 'Move On • Edgy Youthful Expression',
      origin: 'Bangalore, India',
      founded: '1998',
      hallmark: 'Stunners Chrono, Reflex Play Ultra & Vyb Edition',
      color: '#e11d48',
      goldAccent: '#d4af37',
      displayOrder: 4,
      isFeatured: true,
      active: true
    },
    {
      id: 'fossil',
      name: 'Fossil',
      slug: 'fossil',
      tagline: 'Authentic Vintage Style with Modern Soul',
      origin: 'Texas, USA',
      founded: '1984',
      hallmark: 'Townsman Automatic Skeleton & Grant Chronograph',
      color: '#78350f',
      goldAccent: '#d4af37',
      displayOrder: 5,
      isFeatured: true,
      active: true
    },
    {
      id: 'timex',
      name: 'Timex',
      slug: 'timex',
      tagline: 'Takes a Licking and Keeps on Ticking',
      origin: 'Connecticut, USA',
      founded: '1854',
      hallmark: 'Q Reissue 1979 Diver & Marlin Automatic Vintage',
      color: '#0369a1',
      goldAccent: '#d4af37',
      displayOrder: 6,
      isFeatured: true,
      active: true
    },
    {
      id: 'sonata',
      name: 'Sonata',
      slug: 'sonata',
      tagline: 'Style that Resonates with Every Moment',
      origin: 'Tata Group, India',
      founded: '1997',
      hallmark: 'Poze Dual Tone Quartz & Utsav Wedding Heritage',
      color: '#b45309',
      goldAccent: '#d4af37',
      displayOrder: 7,
      isFeatured: true,
      active: true
    },
    {
      id: 'guess',
      name: 'Guess',
      slug: 'guess',
      tagline: 'Glamour, Attitude & Global Runway Elegance',
      origin: 'Los Angeles, USA',
      founded: '1981',
      hallmark: 'Frontier Pavé Crystal & Phoenix Barrel Skeleton',
      color: '#4c1d95',
      goldAccent: '#d4af37',
      displayOrder: 8,
      isFeatured: true,
      active: true
    },
    {
      id: 'limestone',
      name: 'Limestone',
      slug: 'limestone',
      tagline: 'Contemporary Craft • Clean Minimalist Timepieces',
      origin: 'New Delhi, India',
      founded: '2018',
      hallmark: 'Diamond-Cut Prismatic Glass & Chrono-Look Mesh',
      color: '#0f172a',
      goldAccent: '#d4af37',
      displayOrder: 9,
      isFeatured: true,
      active: true
    },
    {
      id: 'noise',
      name: 'Noise',
      slug: 'noise',
      tagline: 'Listen to the Noise Within • Smart Wearables',
      origin: 'Gurugram, India',
      founded: '2014',
      hallmark: 'ColorFit Pro 5 Max & Diva Diamond Smartwatch',
      color: '#0284c7',
      goldAccent: '#d4af37',
      displayOrder: 10,
      isFeatured: true,
      active: true
    }
  ],
  categories: [
    { id: 'cat-all', name: 'All Masterpieces', slug: 'all', displayOrder: 1, active: true },
    { id: 'cat-men', name: "Men's Watches", slug: 'men', displayOrder: 2, active: true },
    { id: 'cat-women', name: "Women's Watches", slug: 'women', displayOrder: 3, active: true },
    { id: 'cat-luxury', name: 'Luxury Watches', slug: 'luxury', displayOrder: 4, active: true },
    { id: 'cat-chrono', name: 'Chronographs', slug: 'chronographs', displayOrder: 5, active: true },
    { id: 'cat-skeletons', name: 'Skeleton Automatics', slug: 'skeletons', displayOrder: 6, active: true },
    { id: 'cat-diamond', name: 'Diamond Editions', slug: 'diamond-editions', displayOrder: 7, active: true },
    { id: 'cat-dive', name: 'Dive & Sport', slug: 'dive-sport', displayOrder: 8, active: true },
    { id: 'cat-automatic', name: 'Automatic Calibres', slug: 'automatic', displayOrder: 9, active: true }
  ],
  products: [
    {
      id: "rolex-submariner-01",
      slug: "rolex-submariner-date-41mm",
      name: "ROLEX Submariner Date 41mm Cerachrom Emerald Luxury Watch - For Men",
      subtitle: "Cerachrom Green Bezel | Oystersteel 904L & Black Sunburst | F-Assured",
      brand: "Rolex",
      category: "Dive & Sport",
      gender: "Men",
      price: 5499,
      comparePrice: 12999,
      sku: "ROL-126610LV",
      modelNumber: "126610LV",
      stock: 14,
      rating: 4.9,
      reviewsCount: 1480,
      isLimited: true,
      isBestSeller: true,
      isNewArrival: false,
      images: [
        "/images/watches/rolex_submariner_1.jpg",
        "/images/watches/rolex_submariner_2.jpg",
        "/images/watches/rolex_submariner_3.jpg",
        "/images/watches/rolex_submariner_4.jpg"
      ],
      description: "The quintessential diving watch. Featuring Rolex's legendary 904L Oystersteel architecture, unidirectional Cerachrom emerald green bezel, date window with Cyclops magnifier, and Chromalight luminescent display.",
      specs: {
        movement: "Perpetual Automatic Calibre 3235 (Superlative Chronometer)",
        powerReserve: "70 Hours",
        caseDiameter: "41 mm",
        caseThickness: "12.3 mm",
        caseMaterial: "Oystersteel 904L & Cerachrom Ceramic Bezel",
        crystal: "Scratch-Resistant Sapphire with Cyclops Date Lens",
        caseback: "Solid Screw-Down Hermetic Caseback",
        waterResistance: "300 Meters / 1,000 Feet",
        strap: "Oystersteel 3-Piece Solid Link Bracelet",
        clasp: "Folding Oysterlock Safety Clasp with Rolex Glidelock Extension",
        warranty: "5 Years International Manufacturer Warranty",
        inTheBox: "1 Watch, Authenticity Guarantee Certificate, Green Leather Presentation Vault",
        origin: "Geneva, Switzerland"
      },
      colors: [{ name: "Emerald Green & Black", hex: "#006039", imageIndex: 0 }],
      straps: [
        { name: "Oystersteel Solid Bracelet", id: "oyster" },
        { name: "Black Oysterflex Rubber", id: "oysterflex" }
      ],
      badge: "F-Assured Official Icon",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "rolex-daytona-02",
      slug: "rolex-cosmograph-daytona-panda",
      name: "ROLEX Cosmograph Daytona 'Panda' Dial Chronograph Watch - For Men",
      subtitle: "Cerachrom Black Bezel | White Lacquer Tri-Compax Chrono | F-Assured",
      brand: "Rolex",
      category: "Chronographs",
      gender: "Men",
      price: 6499,
      comparePrice: 14999,
      sku: "ROL-116500LN",
      modelNumber: "116500LN",
      stock: 8,
      rating: 5.0,
      reviewsCount: 920,
      isLimited: true,
      isBestSeller: true,
      isNewArrival: true,
      images: [
        "/images/watches/rolex_daytona_1.jpg",
        "/images/watches/rolex_daytona_2.jpg",
        "/images/watches/rolex_daytona_3.jpg",
        "/images/watches/rolex_daytona_4.jpg"
      ],
      description: "The benchmark for motorsport chronographs. Equipped with the in-house Calibre 4130 movement, black Cerachrom bezel with tachymetric scale, and high-contrast tri-compax Panda chronograph subdials.",
      specs: {
        movement: "In-House Automatic Calibre 4130 Column-Wheel Chronograph",
        powerReserve: "72 Hours",
        caseDiameter: "40 mm",
        caseThickness: "12.2 mm",
        caseMaterial: "Oystersteel 904L & Black Ceramic Bezel",
        crystal: "Scratch-Resistant Domed Sapphire",
        caseback: "Screw-Down Hermetic Solid Caseback",
        waterResistance: "100 Meters / 330 Feet",
        strap: "Oystersteel 3-Piece Solid Link Bracelet",
        clasp: "Oysterlock Safety Clasp with 5mm Easylink Extension",
        warranty: "5 Years International Manufacturer Warranty",
        inTheBox: "1 Watch, Chronometer Seal, Rolex Green Presentation Box",
        origin: "Geneva, Switzerland"
      },
      colors: [{ name: "Panda White & Black", hex: "#f8fafc", imageIndex: 0 }],
      straps: [{ name: "Oystersteel Solid Bracelet", id: "oyster-daytona" }],
      badge: "Special Price • 57% Off",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "titan-workwear-03",
      slug: "titan-workwear-neo-analog-silver",
      name: "TITAN Workwear Neo Analog Watch - For Men (Silver Dial, Stainless Steel Strap, 1639SM02)",
      subtitle: "Neo Collection | Anthracite Sunburst Dial & Stainless Steel | Flipkart Top Seller",
      brand: "Titan",
      category: "Men's Watches",
      gender: "Men",
      price: 3499,
      comparePrice: 5995,
      sku: "TTN-1639SM02",
      modelNumber: "1639SM02",
      stock: 25,
      rating: 4.8,
      reviewsCount: 3420,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: false,
      images: [
        "/images/watches/titan_workwear_1.jpg",
        "/images/watches/titan_workwear_2.jpg",
        "/images/watches/titan_workwear_3.jpg",
        "/images/watches/titan_workwear_4.jpg"
      ],
      description: "Flipkart's top-selling Titan Workwear Neo timepiece. Features a pristine anthracite dial, polished silver hands, date display, and solid stainless steel link bracelet with push button clasp.",
      specs: {
        movement: "High-Precision Japanese Quartz Movement",
        powerReserve: "3 Years Battery Life",
        caseDiameter: "42 mm",
        caseThickness: "8.9 mm Slim",
        caseMaterial: "Solid 316L Stainless Steel",
        crystal: "Mineral Glass Anti-Scratch",
        caseback: "Stainless Steel Snap-On Caseback",
        waterResistance: "50 Meters / 5 ATM",
        strap: "Stainless Steel Solid Link Bracelet",
        clasp: "3-Piece Deployant Clasp with Push Button",
        warranty: "2 Years International Manufacturer Warranty",
        inTheBox: "1 Watch, Titan Warranty Card, Velvet Presentation Cushion Box",
        origin: "Hosur, India"
      },
      colors: [{ name: "Anthracite Silver & Black", hex: "#334155", imageIndex: 0 }],
      straps: [{ name: "Stainless Steel Links", id: "titan-steel" }],
      badge: "Flipkart #1 Bestseller",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "titan-grandmaster-04",
      slug: "titan-grandmaster-mechanical-automatic",
      name: "TITAN Grandmaster Mechanical Open-Heart Automatic Watch - For Men (90111QL01)",
      subtitle: "24-Jewel Self-Winding In-House Calibre | Rose Gold Case & Italian Leather | F-Assured",
      brand: "Titan",
      category: "Skeleton Automatics",
      gender: "Men",
      price: 4299,
      comparePrice: 8995,
      sku: "TTN-90111QL01",
      modelNumber: "90111QL01",
      stock: 18,
      rating: 4.9,
      reviewsCount: 1860,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: false,
      images: [
        "/images/watches/titan_grandmaster_1.jpg",
        "/images/watches/titan_grandmaster_2.jpg",
        "/images/watches/titan_grandmaster_3.jpg",
        "/images/watches/titan_grandmaster_4.jpg"
      ],
      description: "Titan's flagship automatic masterpiece. Showcasing an open-heart front balance wheel with Roman index markers, high-polish rose gold PVD case, and authentic croco-grain leather strap.",
      specs: {
        movement: "24-Jewel Self-Winding In-House Calibre",
        powerReserve: "42 Hours",
        caseDiameter: "42 mm",
        caseThickness: "11.8 mm",
        caseMaterial: "316L Stainless Steel with Rose Gold PVD",
        crystal: "Curved Mineral Crystal with Anti-Scratch Coating",
        caseback: "Mineral Glass Exhibition Caseback",
        waterResistance: "50 Meters / 5 ATM",
        strap: "Genuine Croc-Embossed Italian Leather",
        clasp: "Deployant Buckle with Titan Insignia",
        warranty: "2 Years International Manufacturer Warranty",
        inTheBox: "1 Watch, Warranty Card, Titan Wooden Presentation Vault",
        origin: "Hosur, India"
      },
      colors: [{ name: "Rose Gold & Dark Brown", hex: "#b45309", imageIndex: 0 }],
      straps: [{ name: "Brown Leather", id: "leather-brown" }],
      badge: "Special Price • 52% Off",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "titan-raga-05",
      slug: "titan-raga-viva-rose-gold-swarovski",
      name: "TITAN Raga Viva Mother of Pearl Swarovski Watch - For Women (2608WM01)",
      subtitle: "Natural Mother of Pearl Dial | Swarovski Crystal Studded Filigree Bracelet",
      brand: "Titan",
      category: "Women's Watches",
      gender: "Women",
      price: 3799,
      comparePrice: 6995,
      sku: "TTN-2608WM01",
      modelNumber: "2608WM01",
      stock: 20,
      rating: 5.0,
      reviewsCount: 2150,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: true,
      images: [
        "/images/watches/titan_raga_1.jpg",
        "/images/watches/titan_raga_2.jpg",
        "/images/watches/titan_raga_3.jpg",
        "/images/watches/titan_raga_4.jpg"
      ],
      description: "Designed for the sophisticated modern woman. Lustrous natural mother-of-pearl dial with Swarovski crystal hour indices, enveloped in a delicate jewellery filigree bracelet.",
      specs: {
        movement: "High-Precision Japanese Quartz Movement",
        powerReserve: "3 Years Battery Life",
        caseDiameter: "29 mm",
        caseThickness: "7.2 mm",
        caseMaterial: "Rose Gold PVD Plated Brass & Crystal Bezel",
        crystal: "Domed Mineral Glass",
        caseback: "Stainless Steel Snap-On Caseback",
        waterResistance: "30 Meters / 3 ATM",
        strap: "Jewellery Self-Adjustable Mesh Link Bracelet",
        clasp: "Jewellery Clasp with Safety Clip",
        warranty: "2 Years International Manufacturer Warranty",
        inTheBox: "1 Watch, Swarovski Authenticity Card, Raga Velvet Box",
        origin: "Hosur, India"
      },
      colors: [{ name: "Champagne Rose Gold", hex: "#fb7185", imageIndex: 0 }],
      straps: [{ name: "Rose Gold Jewellery Mesh", id: "mesh-rosegold" }],
      badge: "Swarovski Crystals • Top Gift",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "casio-gshock-06",
      slug: "casio-gshock-casioak-metal-ga2100",
      name: "CASIO G-Shock 'CasiOak' Octagon Metal Bezel Watch - For Men (GM-2100B-3A)",
      subtitle: "Carbon Core Guard | Forged Stainless Steel Ion Plated & 200M ISO Diver | F-Assured",
      brand: "Casio",
      category: "Dive & Sport",
      gender: "Men",
      price: 3999,
      comparePrice: 8495,
      sku: "CAS-GM2100B",
      modelNumber: "GM-2100B-3A",
      stock: 22,
      rating: 4.9,
      reviewsCount: 4280,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: true,
      images: [
        "/images/watches/casio_gshock_1.jpg",
        "/images/watches/casio_gshock_2.jpg",
        "/images/watches/casio_gshock_3.jpg",
        "/images/watches/casio_gshock_4.jpg"
      ],
      description: "The global phenomenon. Forged stainless steel octagonal bezel over Carbon Core Guard structure. Indestructible shock resistance, 200M diving capability, and stealth double-LED illumination.",
      specs: {
        movement: "Module 5611 Analog-Digital Quartz (±15 sec/month)",
        powerReserve: "3 Years Battery Life (SR726W × 2)",
        caseDiameter: "44.4 mm",
        caseThickness: "11.8 mm",
        caseMaterial: "Resin / Stainless Steel Ion Plated",
        crystal: "Hardened Mineral Glass",
        caseback: "Stainless Steel Screw-Locked Caseback",
        waterResistance: "200 Meters / 20 BAR ISO Diver",
        strap: "Bio-Based Resin & Stainless Steel Pin Buckle",
        clasp: "Heavy-Duty Buckle",
        warranty: "2 Years International Manufacturer Warranty",
        inTheBox: "1 Watch, G-Shock Metal Hexagon Tin, User Manual",
        origin: "Tokyo, Japan"
      },
      colors: [{ name: "Gunmetal & Tactical Green", hex: "#15803d", imageIndex: 0 }],
      straps: [{ name: "Tactical Green Resin", id: "green-resin" }],
      badge: "200M Shockproof • Top Rated",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "casio-vintage-07",
      slug: "casio-vintage-digital-a168w-gold",
      name: "CASIO Vintage A168WG-9WDF ElectroLuminescence Digital Watch - For Men & Women",
      subtitle: "ElectroLuminescent Backlight | Iconic 1980s Retro Digital & Steel Band | Bestseller",
      brand: "Casio",
      category: "Luxury Watches",
      gender: "Unisex",
      price: 2499,
      comparePrice: 4995,
      sku: "CAS-A168WG",
      modelNumber: "A168WG-9WDF",
      stock: 30,
      rating: 4.9,
      reviewsCount: 5120,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: false,
      images: [
        "/images/watches/casio_vintage_1.jpg",
        "/images/watches/casio_vintage_2.jpg",
        "/images/watches/casio_vintage_3.jpg",
        "/images/watches/casio_vintage_4.jpg"
      ],
      description: "The timeless 1980s retro classic. ElectroLuminescent illuminated digital display, 1/100-sec stopwatch, daily alarm, hourly time signal, and gold ion-plated adjustable stainless steel band.",
      specs: {
        movement: "Digital Multi-Function Quartz Module",
        powerReserve: "7 Years Battery Life (CR2016)",
        caseDiameter: "36.3 mm",
        caseThickness: "9.6 mm",
        caseMaterial: "Resin / Chrome Gold Ion Plated",
        crystal: "Resin Glass",
        caseback: "Stainless Steel 4-Screw Caseback",
        waterResistance: "Water Resistant (Splashproof)",
        strap: "Gold Ion Plated Stainless Steel Mesh Band",
        clasp: "Self-Adjustable Sliding Clasp",
        warranty: "2 Years International Manufacturer Warranty",
        inTheBox: "1 Watch, Casio Vintage Box, Warranty Card",
        origin: "Tokyo, Japan"
      },
      colors: [{ name: "Vintage 22K Gold Tone", hex: "#eab308", imageIndex: 0 }],
      straps: [{ name: "Gold Stainless Band", id: "gold-band" }],
      badge: "Flipkart Cult Classic",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "fastrack-stunners-08",
      slug: "fastrack-stunners-multi-function-chrono",
      name: "FASTRACK Stunners Multifunction Analog Watch - For Men (Matte Gunmetal Dial, 3278NM01)",
      subtitle: "Multifunction Day-Date Subdials | Matte Gunmetal IP & Silicone Strap | Hot Deal",
      brand: "Fastrack",
      category: "Dive & Sport",
      gender: "Men",
      price: 2499,
      comparePrice: 4995,
      sku: "FST-3278NM01",
      modelNumber: "3278NM01",
      stock: 24,
      rating: 4.8,
      reviewsCount: 2840,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: false,
      images: [
        "/images/watches/fastrack_stunners_1.jpg",
        "/images/watches/fastrack_stunners_2.jpg",
        "/images/watches/fastrack_stunners_3.jpg",
        "/images/watches/fastrack_stunners_4.jpg"
      ],
      description: "Bold, uninhibited streetwear style. Deep gunmetal ion plating with contrasting orange accent hands, multi-function day-date registers, and sweat-resistant silicone band.",
      specs: {
        movement: "Multi-Function Japanese Quartz (Day, Date, 24-Hour)",
        powerReserve: "2 Years Battery Life",
        caseDiameter: "46 mm",
        caseThickness: "12 mm",
        caseMaterial: "High-Strength Alloy with Matte Gunmetal IP",
        crystal: "Mineral Glass",
        caseback: "Stainless Steel Snap-On Caseback",
        waterResistance: "50 Meters / 5 ATM",
        strap: "High-Grade Textured Flexible Silicone",
        clasp: "Buckle Clasp",
        warranty: "2 Years International Manufacturer Warranty",
        inTheBox: "1 Watch, Fastrack Hex Box, Guarantee Card",
        origin: "Bangalore, India"
      },
      colors: [{ name: "Matte Gunmetal & Crimson", hex: "#dc2626", imageIndex: 0 }],
      straps: [{ name: "Black Silicone Strap", id: "fastrack-silicone" }],
      badge: "50% Off • Youth Icon",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "fastrack-reflex-09",
      slug: "fastrack-reflex-play-ultra-amoled",
      name: "FASTRACK Reflex Play Ultra 1.96'' HD Curved AMOLED Bluetooth Calling Smartwatch",
      subtitle: "Curved AMOLED 600 Nits | Single-Chip BT Calling | 100+ Sports Modes | F-Assured",
      brand: "Fastrack",
      category: "Dive & Sport",
      gender: "Men",
      price: 2999,
      comparePrice: 6995,
      sku: "FST-38072AP01",
      modelNumber: "38072AP01",
      stock: 35,
      rating: 4.7,
      reviewsCount: 3190,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: true,
      images: [
        "/images/watches/fastrack_reflex_1.jpg",
        "/images/watches/fastrack_reflex_2.jpg",
        "/images/watches/fastrack_reflex_3.jpg",
        "/images/watches/fastrack_reflex_4.jpg"
      ],
      description: "Uncompromised smart performance. Brilliant 1.96-inch curved AMOLED display with 600 nits peak brightness, crystal-clear Bluetooth calling, SpO2 & Heart Rate monitoring, and AI voice assistant.",
      specs: {
        movement: "Advanced Fastrack OS & Dual-Core Processor",
        powerReserve: "Up to 7 Days Battery Life (Fast Charging)",
        caseDiameter: "45 mm",
        caseThickness: "10.8 mm",
        caseMaterial: "Aluminium Alloy Chassis & 2.5D Curved Glass",
        crystal: "Scratch-Resistant 2.5D Curved Glass",
        caseback: "Bio-Optical Sensor Ceramic Back",
        waterResistance: "IP68 Dust & Water Resistant",
        strap: "Quick-Release Silicone Sport Strap",
        clasp: "Pin-and-Tuck Sport Buckle",
        warranty: "1 Year International Manufacturer Warranty",
        inTheBox: "1 Smartwatch, Magnetic USB Pogo Pin Charger, User Manual",
        origin: "Bangalore, India"
      },
      colors: [{ name: "Obsidian Black", hex: "#18181b", imageIndex: 0 }],
      straps: [{ name: "Silicone Sport Band", id: "sport-silicone" }],
      badge: "1.96'' Curved AMOLED • 57% Off",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "fossil-townsman-10",
      slug: "fossil-townsman-automatic-skeleton-44mm",
      name: "FOSSIL Townsman Automatic Skeleton Dial Stainless Steel Watch - For Men (ME3110)",
      subtitle: "Exhibition Amber Crystal | Self-Winding Skeleton Movement | F-Assured",
      brand: "Fossil",
      category: "Skeleton Automatics",
      gender: "Men",
      price: 4899,
      comparePrice: 11995,
      sku: "FSL-ME3110",
      modelNumber: "ME3110",
      stock: 15,
      rating: 4.9,
      reviewsCount: 1650,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: false,
      images: [
        "/images/watches/fossil_townsman_1.jpg",
        "/images/watches/fossil_townsman_2.jpg",
        "/images/watches/fossil_townsman_3.jpg",
        "/images/watches/fossil_townsman_4.jpg"
      ],
      description: "Taking cues from 1960s architectural minimalism. Dual sub-second dials set against a clear exhibition skeleton movement that reveals intricate gear trains with every tick.",
      specs: {
        movement: "21-Jewel Automatic Mechanical Skeleton Calibre",
        powerReserve: "40 Hours",
        caseDiameter: "44 mm",
        caseThickness: "12 mm",
        caseMaterial: "Satin-Brushed 316L Stainless Steel",
        crystal: "Hardened Mineral Crystal",
        caseback: "Screw-Down Mineral Exhibition Caseback",
        waterResistance: "50 Meters / 5 ATM",
        strap: "22mm Interchangeable Dark Brown Tuscan Leather",
        clasp: "Prong Strap Buckle with Fossil Engraving",
        warranty: "2 Years International Manufacturer Warranty",
        inTheBox: "1 Watch, Fossil Collector Tin, Instruction Manual",
        origin: "Texas, USA"
      },
      colors: [{ name: "Amber Skeleton & Brown", hex: "#78350f", imageIndex: 0 }],
      straps: [{ name: "Tuscan Leather", id: "fossil-leather" }],
      badge: "Exhibition Skeleton • 59% Off",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "fossil-grant-11",
      slug: "fossil-grant-chronograph-vintage-leather",
      name: "FOSSIL Grant Chronograph Blue Sunray Dial Leather Watch - For Men (FS4835)",
      subtitle: "Classic Roman Numerals | 3-Eye Stopwatch | Saddle Brown Genuine Leather",
      brand: "Fossil",
      category: "Chronographs",
      gender: "Men",
      price: 3999,
      comparePrice: 9995,
      sku: "FSL-FS4835",
      modelNumber: "FS4835",
      stock: 19,
      rating: 4.8,
      reviewsCount: 2190,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: true,
      images: [
        "/images/watches/fossil_grant_1.jpg",
        "/images/watches/fossil_grant_2.jpg",
        "/images/watches/fossil_grant_3.jpg",
        "/images/watches/fossil_grant_4.jpg"
      ],
      description: "Inspired by vintage clocks. Rich blue sunray dial complemented by classic Roman numerals, 3-eye chronograph stopwatch counters, and hand-stitched saddle leather strap.",
      specs: {
        movement: "Japanese Quartz Chronograph Movement",
        powerReserve: "2 Years Battery Life",
        caseDiameter: "44 mm",
        caseThickness: "12 mm",
        caseMaterial: "Rose Gold PVD Plated Stainless Steel",
        crystal: "Mineral Glass",
        caseback: "Solid Stainless Steel Caseback",
        waterResistance: "50 Meters / 5 ATM",
        strap: "22mm Genuine Calfskin Saddle Brown Leather",
        clasp: "Traditional Pin Buckle",
        warranty: "2 Years International Manufacturer Warranty",
        inTheBox: "1 Watch, Fossil Vintage Collector Tin Box, Warranty Guide",
        origin: "Texas, USA"
      },
      colors: [{ name: "Ocean Blue & Rose Gold", hex: "#1e3a8a", imageIndex: 0 }],
      straps: [{ name: "Saddle Brown Leather", id: "grant-leather" }],
      badge: "Special Price • 60% Off",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "timex-q-12",
      slug: "timex-q-reissue-1979-diver-heritage",
      name: "TIMEX Q Reissue 1979 Diver Heritage Pepsi Bezel Mesh Watch - For Men (TW2T80700)",
      subtitle: "Rotating Pepsi Bezel | Woven Stainless Steel Mesh | Coin-Slot Battery Hatch | F-Assured",
      brand: "Timex",
      category: "Dive & Sport",
      gender: "Men",
      price: 3899,
      comparePrice: 7995,
      sku: "TMX-TW2T80700",
      modelNumber: "TW2T80700",
      stock: 16,
      rating: 4.9,
      reviewsCount: 1420,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: false,
      images: [
        "/images/watches/timex_q_1.jpg",
        "/images/watches/timex_q_2.jpg",
        "/images/watches/timex_q_3.jpg",
        "/images/watches/timex_q_4.jpg"
      ],
      description: "First released in 1979, the Q Timex gave a whole generation a modern quartz watch with diver-inspired styling. Featuring a true-to-the-era functional battery hatch, rotating Pepsi bezel, and woven stainless-steel bracelet.",
      specs: {
        movement: "Seiko-Origin High-Accuracy Quartz Movement with Day-Date",
        powerReserve: "3 Years (Coin-Slot Battery Hatch on Caseback)",
        caseDiameter: "38 mm",
        caseThickness: "11.5 mm",
        caseMaterial: "316L Stainless Steel with Rotating Red/Blue Bezel",
        crystal: "Vintage Domed Acrylic Crystal",
        caseback: "Solid Caseback with Functional Battery Hatch",
        waterResistance: "50 Meters / 5 ATM",
        strap: "Woven Stainless Steel Mesh Bracelet",
        clasp: "Self-Adjustable Sliding Clasp",
        warranty: "2 Years International Manufacturer Warranty",
        inTheBox: "1 Watch, Timex Q Heritage Box, Warranty Card",
        origin: "Connecticut, USA"
      },
      colors: [{ name: "Pepsi Blue & Red", hex: "#1d4ed8", imageIndex: 0 }],
      straps: [{ name: "Woven Steel Mesh", id: "timex-mesh" }],
      badge: "1979 Vintage Reissue • Top Seller",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "timex-marlin-13",
      slug: "timex-marlin-automatic-vintage-40mm",
      name: "TIMEX Marlin 21-Jewel Automatic Vintage Exhibition Watch - For Men (TW2T22700)",
      subtitle: "Mid-Century Domed Crystal | Miyota Mechanical Movement | Exhibition Caseback",
      brand: "Timex",
      category: "Automatic Calibres",
      gender: "Men",
      price: 4499,
      comparePrice: 9995,
      sku: "TMX-TW2T22700",
      modelNumber: "TW2T22700",
      stock: 12,
      rating: 5.0,
      reviewsCount: 980,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: true,
      images: [
        "/images/watches/timex_marlin_1.jpg",
        "/images/watches/timex_marlin_2.jpg",
        "/images/watches/timex_marlin_3.jpg",
        "/images/watches/timex_marlin_4.jpg"
      ],
      description: "A true design icon from the 1960s. Reimagined with a 21-jewel automatic movement, this gentleman's timepiece pairs sleek mid-century indices with a domed crystal and exhibition caseback.",
      specs: {
        movement: "21-Jewel Miyota Mechanical Automatic (Self-Winding)",
        powerReserve: "40 Hours",
        caseDiameter: "40 mm",
        caseThickness: "13 mm",
        caseMaterial: "Polished 316L Stainless Steel",
        crystal: "Domed Acrylic Crystal",
        caseback: "Exhibition Window Display Caseback",
        waterResistance: "30 Meters / 3 ATM",
        strap: "Croc-Patterned Genuine Leather Strap",
        clasp: "Stainless Steel Buckle",
        warranty: "2 Years International Manufacturer Warranty",
        inTheBox: "1 Watch, Timex Marlin Presentation Box, Manual",
        origin: "Connecticut, USA"
      },
      colors: [{ name: "Silver Sunray & Black", hex: "#64748b", imageIndex: 0 }],
      straps: [{ name: "Black Leather", id: "marlin-leather" }],
      badge: "Automatic 21-Jewel • 55% Off",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "sonata-poze-14",
      slug: "sonata-poze-royal-gold-dual-tone",
      name: "SONATA Poze Royal Gold-Tone Fluted Bezel Day & Date Watch - For Men (SP70014YM01)",
      subtitle: "Fluted Gold Bezel | Champagne Sunray Dial & Day-Date Display | Tata Trust | F-Assured",
      brand: "Sonata",
      category: "Luxury Watches",
      gender: "Men",
      price: 1999,
      comparePrice: 3995,
      sku: "SNT-SP70014YM01",
      modelNumber: "SP70014YM01",
      stock: 30,
      rating: 4.8,
      reviewsCount: 3840,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: false,
      images: [
        "/images/watches/sonata_poze_1.jpg",
        "/images/watches/sonata_poze_2.jpg",
        "/images/watches/sonata_poze_3.jpg",
        "/images/watches/sonata_poze_4.jpg"
      ],
      description: "Classic prestige at an unbeatable value from Tata Group. Fluted gold-tone bezel, radiant champagne sunray dial with day-date window, and dual-tone stainless steel link bracelet.",
      specs: {
        movement: "High-Accuracy Japanese Quartz",
        powerReserve: "3 Years Battery Life",
        caseDiameter: "41 mm",
        caseThickness: "9 mm",
        caseMaterial: "Dual-Tone Gold Plated Alloy",
        crystal: "Mineral Glass",
        caseback: "Stainless Steel Snap-On Caseback",
        waterResistance: "30 Meters / 3 ATM Splashproof",
        strap: "Dual Tone Stainless Steel Bracelet",
        clasp: "Foldover Clasp with Safety Catch",
        warranty: "1 Year International Manufacturer Warranty",
        inTheBox: "1 Watch, Sonata Box, Tata Warranty Card",
        origin: "Tata Group, India"
      },
      colors: [{ name: "Gold & Champagne", hex: "#eab308", imageIndex: 0 }],
      straps: [{ name: "Dual Tone Steel", id: "poze-dualtone" }],
      badge: "Tata Trust • 50% Off",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "sonata-utsav-15",
      slug: "sonata-utsav-wedding-gold-heritage",
      name: "SONATA Utsav Wedding Filigree Carved Heritage Gold Watch - For Women (8976YM01)",
      subtitle: "22K Gold Tone Electroplated | Carved Filigree Floral Bracelet | Wedding Festive",
      brand: "Sonata",
      category: "Women's Watches",
      gender: "Women",
      price: 2199,
      comparePrice: 4495,
      sku: "SNT-8976YM01",
      modelNumber: "8976YM01",
      stock: 22,
      rating: 4.9,
      reviewsCount: 1980,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: true,
      images: [
        "/images/watches/sonata_utsav_1.jpg",
        "/images/watches/sonata_utsav_2.jpg",
        "/images/watches/sonata_utsav_3.jpg",
        "/images/watches/sonata_utsav_4.jpg"
      ],
      description: "Crafted for festive splendour and Indian wedding celebrations. Exquisite gold-tone filigree bracelet with traditional floral etching and sparkling stone accents.",
      specs: {
        movement: "High-Precision Quartz Movement",
        powerReserve: "3 Years Battery Life",
        caseDiameter: "30 mm",
        caseThickness: "7.5 mm",
        caseMaterial: "22K Gold Ion Plated Brass",
        crystal: "Mineral Glass",
        caseback: "Stainless Steel Snap-On Caseback",
        waterResistance: "30 Meters / 3 ATM",
        strap: "Carved Filigree Jewellery Bracelet",
        clasp: "Self-Adjustable Jewellery Clasp",
        warranty: "1 Year International Manufacturer Warranty",
        inTheBox: "1 Watch, Utsav Presentation Box, Warranty Card",
        origin: "Tata Group, India"
      },
      colors: [{ name: "22K Yellow Gold", hex: "#ca8a04", imageIndex: 0 }],
      straps: [{ name: "Filigree Gold Bracelet", id: "filigree-gold" }],
      badge: "Wedding Festive Special",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "guess-frontier-16",
      slug: "guess-frontier-crystal-paved-gold",
      name: "GUESS Frontier Full Pavé Crystal Studded Multifunction Gold Watch - For Men (W1132G1)",
      subtitle: "Hundreds of Iced-Out Diamond Cut Crystals | 3-Eye Day-Date Gold Bracelet | F-Assured",
      brand: "Guess",
      category: "Diamond Editions",
      gender: "Men",
      price: 4999,
      comparePrice: 12995,
      sku: "GSS-W1132G1",
      modelNumber: "W1132G1",
      stock: 12,
      rating: 5.0,
      reviewsCount: 1380,
      isLimited: true,
      isBestSeller: true,
      isNewArrival: false,
      images: [
        "/images/watches/guess_frontier_1.jpg",
        "/images/watches/guess_frontier_2.jpg",
        "/images/watches/guess_frontier_3.jpg",
        "/images/watches/guess_frontier_4.jpg"
      ],
      description: "Maximum red-carpet luxury. Encrusted with hundreds of precision-cut sparkling crystals across the bezel, dial, and bracelet links. Features 3 multi-function chronograph counters.",
      specs: {
        movement: "Multi-Function Japanese Quartz",
        powerReserve: "2 Years Battery Life",
        caseDiameter: "48 mm Bold Oversized",
        caseThickness: "13.4 mm",
        caseMaterial: "Polished Gold Ion-Plated Stainless Steel & Crystal Pavé",
        crystal: "Scratch-Resistant Mineral Glass",
        caseback: "Stainless Steel Screw-Down Caseback",
        waterResistance: "50 Meters / 5 ATM",
        strap: "Full Crystal Studded Gold-Tone Bracelet",
        clasp: "Pilot Foldover Deployant Clasp",
        warranty: "2 Years International Manufacturer Warranty",
        inTheBox: "1 Watch, Guess Luxury Red Box, Warranty Card",
        origin: "Los Angeles, USA"
      },
      colors: [{ name: "Iced Out Gold Pavé", hex: "#facc15", imageIndex: 0 }],
      straps: [{ name: "Crystal Pavé Bracelet", id: "pave-gold" }],
      badge: "Full Crystal Pavé • 61% Off",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "guess-phoenix-17",
      slug: "guess-phoenix-tonneau-barrel-skeleton",
      name: "GUESS Phoenix Tonneau Barrel Layered Skeleton Silicone Watch - For Men (GW0202G1)",
      subtitle: "Curved Ergonomic Barrel Silhouette | Layered Skeleton Dial & Flexible Silicone",
      brand: "Guess",
      category: "Skeleton Automatics",
      gender: "Men",
      price: 4699,
      comparePrice: 10995,
      sku: "GSS-GW0202G1",
      modelNumber: "GW0202G1",
      stock: 14,
      rating: 4.9,
      reviewsCount: 1120,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: true,
      images: [
        "/images/watches/guess_phoenix_1.jpg",
        "/images/watches/guess_phoenix_2.jpg",
        "/images/watches/guess_phoenix_3.jpg",
        "/images/watches/guess_phoenix_4.jpg"
      ],
      description: "Avant-garde haute horlogerie silhouette. Tonneau barrel-shaped case with industrial screw accents, layered skeletonized dial, and integrated flexible silicone band.",
      specs: {
        movement: "Japanese Multi-Layer Skeleton Quartz Movement",
        powerReserve: "3 Years Battery Life",
        caseDiameter: "43 mm Tonneau Barrel",
        caseThickness: "12.5 mm",
        caseMaterial: "Black & Rose Gold Ion Plated Stainless Steel",
        crystal: "Curved Mineral Crystal",
        caseback: "Stainless Steel 4-Screw Caseback",
        waterResistance: "50 Meters / 5 ATM",
        strap: "High-Grade Textured Flexible Silicone",
        clasp: "Heavy-Duty Buckle",
        warranty: "2 Years International Manufacturer Warranty",
        inTheBox: "1 Watch, Guess Velvet Pouch & Box, Manual",
        origin: "Los Angeles, USA"
      },
      colors: [{ name: "Rose Gold & Onyx Black", hex: "#be185d", imageIndex: 0 }],
      straps: [{ name: "Black Silicone", id: "phoenix-silicone" }],
      badge: "Tonneau Barrel • 57% Off",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "limestone-daydate-18",
      slug: "limestone-daydate-emerald-sunburst",
      name: "LIMESTONE Day & Date Magnetic Mesh Stainless Steel Watch - For Men (LS2024-GRN)",
      subtitle: "Emerald Sunburst Dial | Magnetic Milanese Mesh Strap | Flipkart Bestseller | F-Assured",
      brand: "Limestone",
      category: "Chronographs",
      gender: "Men",
      price: 1899,
      comparePrice: 4299,
      sku: "LMS-LS2024-GRN",
      modelNumber: "LS2024-GRN",
      stock: 35,
      rating: 4.8,
      reviewsCount: 4120,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: false,
      images: [
        "/images/watches/limestone_daydate_1.jpg",
        "/images/watches/limestone_daydate_2.jpg",
        "/images/watches/limestone_daydate_3.jpg",
        "/images/watches/limestone_daydate_4.jpg"
      ],
      description: "One of Flipkart's most viral men's watches. Deep emerald green sunburst dial with high-polished silver indices, decorative multi-dial chronograph layout, and magnetic Milanese stainless steel mesh strap.",
      specs: {
        movement: "Precision Japanese Quartz with Day-Date Subdials",
        powerReserve: "2 Years Battery Life",
        caseDiameter: "42 mm",
        caseThickness: "11 mm",
        caseMaterial: "High-Polish Silver Ion Plated Alloy",
        crystal: "Hardened Mineral Glass",
        caseback: "Stainless Steel Snap-On Back",
        waterResistance: "30 Meters / 3 ATM",
        strap: "Magnetic Milanese Stainless Steel Mesh Strap",
        clasp: "Strong Magnetic Snap Clasp",
        warranty: "1 Year International Manufacturer Warranty",
        inTheBox: "1 Watch, Limestone Hardcase Box, Warranty Card",
        origin: "New Delhi, India"
      },
      colors: [{ name: "Emerald Green & Silver", hex: "#047857", imageIndex: 0 }],
      straps: [{ name: "Magnetic Milanese Mesh", id: "milanese-mesh" }],
      badge: "Flipkart Top Deal • 56% Off",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "limestone-diamond-19",
      slug: "limestone-diamond-cut-prismatic-glass",
      name: "LIMESTONE Diamond-Cut Prismatic Faceted Glass Quartz Watch - For Men (LS2021-BLK)",
      subtitle: "3D Geometric Faceted Crystal | Matte Black Stainless Steel Milanese Mesh",
      brand: "Limestone",
      category: "Luxury Watches",
      gender: "Men",
      price: 1699,
      comparePrice: 3999,
      sku: "LMS-LS2021-BLK",
      modelNumber: "LS2021-BLK",
      stock: 40,
      rating: 4.7,
      reviewsCount: 3820,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: true,
      images: [
        "/images/watches/limestone_diamond_1.jpg",
        "/images/watches/limestone_diamond_2.jpg",
        "/images/watches/limestone_diamond_3.jpg",
        "/images/watches/limestone_diamond_4.jpg"
      ],
      description: "Geometric brilliance. Multi-faceted diamond-cut glass reflects kaleidoscopic rays of light, set over a minimalist sunburst dial with magnetic Milanese mesh strap.",
      specs: {
        movement: "Precision Japanese Quartz Movement",
        powerReserve: "2 Years Battery Life",
        caseDiameter: "40 mm",
        caseThickness: "10 mm",
        caseMaterial: "Matte Black Ion-Plated Alloy",
        crystal: "3D Geometric Diamond-Cut Faceted Glass",
        caseback: "Stainless Steel Snap-On Caseback",
        waterResistance: "30 Meters / 3 ATM Splashproof",
        strap: "Magnetic Milanese Stainless Steel Mesh Strap",
        clasp: "Strong Magnetic Snap Clasp",
        warranty: "1 Year International Manufacturer Warranty",
        inTheBox: "1 Watch, Limestone Hardcase Box, User Manual",
        origin: "New Delhi, India"
      },
      colors: [{ name: "Faceted Black Crystal", hex: "#1e293b", imageIndex: 0 }],
      straps: [{ name: "Milanese Magnetic Mesh", id: "milanese-mesh-blk" }],
      badge: "Diamond-Cut Glass • 57% Off",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "noise-colorfit-20",
      slug: "noise-colorfit-pro-5-max-luxury-edition",
      name: "NOISE ColorFit Pro 5 Max 1.96'' Super AMOLED BT Calling Smartwatch (WRB-SW-COLORFITPRO5MAX)",
      subtitle: "1.96'' AMOLED Always-On (410x502) | Metallic Frame & Mesh Strap | Tru Sync Calling | F-Assured",
      brand: "Noise",
      category: "Dive & Sport",
      gender: "Men",
      price: 3499,
      comparePrice: 7999,
      sku: "NOI-CFP5-MAX",
      modelNumber: "WRB-SW-COLORFITPRO5MAX",
      stock: 35,
      rating: 4.9,
      reviewsCount: 6420,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: true,
      images: [
        "/images/watches/noise_colorfit_1.jpg",
        "/images/watches/noise_colorfit_2.jpg",
        "/images/watches/noise_colorfit_3.jpg",
        "/images/watches/noise_colorfit_4.jpg"
      ],
      description: "Flipkart's top-rated premium smartwatch. Expansive 1.96-inch AMOLED display (410x502 px, 60Hz), metallic frame, Tru Sync Bluetooth Calling, rapid wireless charging, and 100+ sports modes.",
      specs: {
        movement: "Noise Health Suite v5.0 with Dual-Core Sensor",
        powerReserve: "Up to 7 Days Battery (Rapid Fast Charging)",
        caseDiameter: "45 mm",
        caseThickness: "10.4 mm",
        caseMaterial: "Metallic Zinc Alloy Chassis with Matte Anodized Bezel",
        crystal: "2.5D Curved Scratch-Resistant Sapphire Coating",
        caseback: "Bio-Tracker Optical PPG Sensor Back",
        waterResistance: "IP68 Certified Water & Dust Resistance",
        strap: "Premium Stainless Steel Magnetic Mesh & Extra Silicone Strap",
        clasp: "Strong Magnetic Wrap Clasp",
        warranty: "1 Year International Manufacturer Warranty",
        inTheBox: "1 Smartwatch, Magnetic Charging Cable, Extra Silicone Strap, User Manual",
        origin: "Gurugram, India"
      },
      colors: [{ name: "Starlight Silver & Mesh", hex: "#94a3b8", imageIndex: 0 }],
      straps: [
        { name: "Stainless Steel Mesh", id: "noise-mesh" },
        { name: "Midnight Silicone", id: "noise-silicone" }
      ],
      badge: "1.96'' AMOLED • 56% Off",
      badgeType: "gold",
      returnEligible: true,
      active: true
    },
    {
      id: "noise-diva-21",
      slug: "noise-diva-diamond-crystal-smartwatch",
      name: "NOISE Diva Diamond-Cut Crystal Smartwatch with AMOLED Display - For Women (WRB-SW-DIVA-GLD)",
      subtitle: "Diamond Studded Bezel | 1.1'' Round AMOLED | Women's Health Tracker | F-Assured",
      brand: "Noise",
      category: "Women's Watches",
      gender: "Women",
      price: 3299,
      comparePrice: 6999,
      sku: "NOI-DIVA-GLD",
      modelNumber: "WRB-SW-DIVA-GLD",
      stock: 28,
      rating: 5.0,
      reviewsCount: 2840,
      isLimited: false,
      isBestSeller: true,
      isNewArrival: false,
      images: [
        "/images/watches/noise_diva_1.jpg",
        "/images/watches/noise_diva_2.jpg",
        "/images/watches/noise_diva_3.jpg",
        "/images/watches/noise_diva_4.jpg"
      ],
      description: "Smart meets luxury jewellery on Flipkart. Diamond-cut studded bezel with brilliant 1.1-inch round AMOLED display, dedicated female cycle tracking, and luxury rose gold metal mesh band.",
      specs: {
        movement: "Noise Diva Smart Suite & Biosensor",
        powerReserve: "Up to 4 Days Battery Life",
        caseDiameter: "38 mm",
        caseThickness: "9.8 mm Slim",
        caseMaterial: "Rose Gold PVD Alloy & Diamond-Cut Crystal Inlays",
        crystal: "Toughened Mineral Glass with Diamond Cut Outer Ring",
        caseback: "Optical Health Sensor Back",
        waterResistance: "IP67 Water Resistant",
        strap: "Rose Gold Stainless Steel Mesh Bracelet",
        clasp: "Self-Adjustable Jewellery Clasp",
        warranty: "1 Year International Manufacturer Warranty",
        inTheBox: "1 Smartwatch, Rose Gold Charging Dock, Warranty Guide",
        origin: "Gurugram, India"
      },
      colors: [{ name: "Rose Gold & Crystal", hex: "#f43f5e", imageIndex: 0 }],
      straps: [{ name: "Rose Gold Mesh", id: "diva-rosegold" }],
      badge: "Diamond Cut Bezel • 53% Off",
      badgeType: "gold",
      returnEligible: true,
      active: true
    }
  ],
  coupons: [
    { code: "LUXE10", discountPercent: 10, minSpend: 4000, description: "10% off on all luxury brand timepieces" },
    { code: "ROYAL15", discountPercent: 15, minSpend: 8000, description: "15% VIP discount on orders above ₹8,000" },
    { code: "WELCOME10", discountPercent: 10, minSpend: 3000, description: "10% welcome privilege for new collectors" },
    { code: "DIAMOND20", discountPercent: 20, minSpend: 10000, description: "20% off for connoisseurs ordering multiple watches" }
  ],
  reviews: [
    {
      id: "rev-01",
      productId: "rolex-submariner-01",
      author: "Vikramaditya Singhania (Mumbai)",
      rating: 5,
      date: "2 days ago",
      title: "Superb craftsmanship and swift delivery",
      comment: "The Cerachrom emerald green bezel catches the light exquisitely. Authenticated, calibrated, and delivered in pristine hermetic security vault box within 24 hours.",
      verified: true,
      avatar: "VS",
      status: "approved"
    },
    {
      id: "rev-02",
      productId: "omega-speedmaster-02",
      author: "Rohan Mehta (New Delhi)",
      rating: 5,
      date: "5 days ago",
      title: "The iconic Moonwatch feel",
      comment: "Flawless chronograph action and crisp dial typography. Wearing this Omega Speedmaster connects you to genuine horological heritage.",
      verified: true,
      avatar: "RM",
      status: "approved"
    },
    {
      id: "rev-03",
      productId: "patek-nautilus-03",
      author: "Ananya Deshmukh (Bengaluru)",
      rating: 5,
      date: "1 week ago",
      title: "Patek Nautilus blue dial is mesmerizing",
      comment: "The horizontally embossed blue sunburst dial shifts subtly under natural light. Fits like a second skin on the wrist.",
      verified: true,
      avatar: "AD",
      status: "approved"
    }
  ],
  activityLog: [
    { id: "act-1", text: "Collector in Mumbai viewed Rolex Submariner Date 41mm", time: "Just now", type: "view" },
    { id: "act-2", text: "Consignment ORD-LW-98421 placed for ₹5,499", time: "12m ago", type: "order" },
    { id: "act-3", text: "5-star review verified for Omega Speedmaster Moonwatch", time: "45m ago", type: "review" },
    { id: "act-4", text: "VIP Patron applied code LUXE10 in cart", time: "1h ago", type: "coupon" }
  ],
  returns: [],
  orders: [],
  users: [],
  payments: [],
  storeSettings: {
    key: 'global_settings',
    storeName: 'LUXURY WATCH',
    tagline: 'TIMELESS WATCHES. EXCEPTIONAL VALUE.',
    supportEmail: 'concierge@luxurywatch.com',
    supportPhone: '+91 22 6940 8800',
    address: 'Level 12, The Capital, Bandra Kurla Complex (BKC), Mumbai 400051',
    currency: 'INR',
    currencySymbol: '₹',
    freeShippingThreshold: 999,
    standardShippingFee: 0,
    expressShippingFee: 499,
    taxPercent: 18,
    returnWindowDays: 10,
    enableUpi: true,
    enableRazorpay: true,
    enableCard: true,
    enableNetbanking: true,
    paymentGatewayMode: 'test',
    razorpayKeyIdConfigured: true,
    razorpaySecretConfigured: true
  },
  homepageContent: {
    key: 'homepage_cms',
    announcementBar: {
      text: 'FREE SHIPPING ABOVE ₹999 | SECURE PAYMENTS | EASY RETURNS',
      active: true,
      link: '/shop'
    },
    hero: {
      heading: 'TIMELESS STYLE.\nPERFECTLY PRICED.',
      subheading: 'Discover authentic branded watches crafted for every occasion.',
      badgeText: 'THE 2026 HOROLOGY COLLECTION • GENEVA & LONDON',
      ctaPrimaryText: 'SHOP ALL WATCHES',
      ctaPrimaryLink: '/shop',
      ctaSecondaryText: 'EXPLORE SKELETONS',
      ctaSecondaryLink: '/shop?category=Skeletons',
      active: true
    }
  },
  admin: {
    email: "admin@luxurywatch.com",
    role: "Grand Horologist / Master Administrator",
    lastLogin: "2026-08-26T00:00:00Z"
  }
};

// Local JSON File Storage Helpers
export const readDb = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(INITIAL_SEED);
      return INITIAL_SEED;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Ensure all required top-level collections exist
    let mutated = false;
    ['brands', 'categories', 'products', 'coupons', 'reviews', 'activityLog', 'returns', 'orders', 'users', 'payments'].forEach(col => {
      if (!parsed[col]) {
        parsed[col] = INITIAL_SEED[col] || [];
        mutated = true;
      }
    });

    if (!parsed.storeSettings) {
      parsed.storeSettings = INITIAL_SEED.storeSettings;
      mutated = true;
    }
    if (!parsed.homepageContent) {
      parsed.homepageContent = INITIAL_SEED.homepageContent;
      mutated = true;
    }

    if (mutated) {
      writeDb(parsed);
    }

    return parsed;
  } catch (err) {
    return INITIAL_SEED;
  }
};

export const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[DB Write Error]:', err.message);
    return false;
  }
};

// Initialize MongoDB Connection
let isMongoConnected = false;
let mongoConnectionError = null;
const MONGODB_URI = process.env.MONGODB_URI || '';

export const connectMongoDB = async (customUri) => {
  const uri = customUri !== undefined ? customUri : (process.env.MONGODB_URI || '');
  if (!uri) {
    console.log('ℹ️ [Database] MONGODB_URI not configured. Operating in local JSON storage mode.');
    return false;
  }

  if (isMongoConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    console.log('[Database] Connecting to MongoDB Atlas cluster...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    isMongoConnected = true;
    mongoConnectionError = null;
    console.log('✅ [Database] MongoDB Atlas Connected Successfully!');
    return true;
  } catch (err) {
    isMongoConnected = false;
    mongoConnectionError = err;
    console.error('❌ [Database Connection Error] Failed to connect to MongoDB:');
    console.error(`   ${err.message}`);
    console.error('❌ [Database] Local storage fallback is disabled because MONGODB_URI is configured.');
    throw new Error(`[Database Connection Error] MongoDB connection failed: ${err.message}`);
  }
};

export const disconnectMongoDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (e) {}
  isMongoConnected = false;
};

// Auto-init connection in background if MONGODB_URI is provided
if (MONGODB_URI) {
  connectMongoDB().catch(() => {
    // Initial error logged cleanly inside connectMongoDB
  });
}

// Guard to ensure no silent fallback occurs if MONGODB_URI was configured but failed to connect
const ensureDbAccess = () => {
  const uri = process.env.MONGODB_URI || '';
  if (uri && !isMongoConnected) {
    const reason = mongoConnectionError ? mongoConnectionError.message : 'MongoDB connection not established';
    throw new Error(`[Database Error] MongoDB connection unavailable (${reason}). Local storage fallback is disabled.`);
  }
};

// Unified DB Interface
export const db = {
  isMongo: () => isMongoConnected,
  getConnectionError: () => mongoConnectionError,
  getCollection: (name) => {
    ensureDbAccess();
    const store = readDb();
    return store[name] || [];
  },
  setCollection: (name, items) => {
    ensureDbAccess();
    const store = readDb();
    store[name] = items;
    return writeDb(store);
  },
  findById: (name, id) => {
    ensureDbAccess();
    const store = readDb();
    const items = store[name] || [];
    return items.find(item => item.id === id || item._id === id || item.slug === id);
  },
  findOne: (name, predicate) => {
    ensureDbAccess();
    const store = readDb();
    const items = store[name] || [];
    return items.find(predicate);
  },
  insert: (name, item) => {
    ensureDbAccess();
    const store = readDb();
    if (!store[name]) store[name] = [];
    store[name].unshift(item);
    writeDb(store);
    return item;
  },
  updateById: (name, id, updates) => {
    ensureDbAccess();
    const store = readDb();
    const items = store[name] || [];
    const idx = items.findIndex(item => item.id === id || item._id === id || item.slug === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
      store[name] = items;
      writeDb(store);
      return items[idx];
    }
    return null;
  },
  update: (name, id, updates) => {
    return db.updateById(name, id, updates);
  },
  deleteById: (name, id) => {
    ensureDbAccess();
    const store = readDb();
    const items = store[name] || [];
    const filtered = items.filter(item => item.id !== id && item._id !== id && item.slug !== id);
    if (filtered.length !== items.length) {
      store[name] = filtered;
      writeDb(store);
      return true;
    }
    return false;
  },
  delete: (name, id) => {
    return db.deleteById(name, id);
  },
  getMeta: (key) => {
    ensureDbAccess();
    const store = readDb();
    return store[key];
  },
  setMeta: (key, val) => {
    ensureDbAccess();
    const store = readDb();
    store[key] = val;
    return writeDb(store);
  }
};

// Initial store verification
readDb();

export default db;

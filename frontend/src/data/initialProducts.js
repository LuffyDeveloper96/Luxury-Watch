export const INITIAL_PRODUCTS = [
  {
    id: "rolex-submariner-01",
    name: "Rolex Submariner Date 41mm",
    subtitle: "Cerachrom Green Bezel | Oystersteel 904L & Black Sunburst",
    brand: "Rolex",
    category: "Dive & Sport",
    price: 5499,
    comparePrice: 6499,
    sku: "ROL-SUB-41-GRN",
    stock: 14,
    rating: 4.9,
    reviewsCount: 128,
    isLimited: true,
    isBestSeller: true,
    isNew: false,
    images: [
      "/images/watches/rolex_submariner.jpg"
    ],
    description: "The quintessential diving watch. Featuring Rolex's legendary 904L Oystersteel architecture, unidirectional Cerachrom emerald green bezel, date window with Cyclops magnifier, and Chromalight luminescent display. Engineered for underwater exploration and black-tie elegance.",
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
      clasp: "Folding Oysterlock Safety Clasp with Rolex Glidelock Extension"
    },
    colors: [
      { name: "Emerald Green & Black", hex: "#006039", imageIndex: 0 }
    ],
    straps: [
      { name: "Oystersteel Solid Bracelet", id: "oyster" },
      { name: "Black Oysterflex Rubber", id: "oysterflex" }
    ],
    badge: "Official Rolex Icon"
  },
  {
    id: "omega-speedmaster-02",
    name: "Omega Speedmaster Moonwatch Professional",
    subtitle: "Co-Axial Master Chronometer | Matte Black Step Dial & Tachymeter",
    brand: "Omega",
    category: "Chronographs",
    price: 5299,
    comparePrice: 6199,
    sku: "OMG-SPD-42-MOON",
    stock: 10,
    rating: 5.0,
    reviewsCount: 94,
    isLimited: false,
    isBestSeller: true,
    isNew: false,
    images: [
      "/images/watches/omega_speedmaster.jpg"
    ],
    description: "The legendary timepiece that went to the Moon on Apollo 11. Powered by the Master Chronometer-certified Calibre 3861 manual-wind movement, featuring the iconic dot over ninety on the black anodised aluminium bezel ring.",
    specs: {
      movement: "Omega Co-Axial Master Chronometer Calibre 3861 (15,000 Gauss)",
      powerReserve: "50 Hours",
      caseDiameter: "42 mm",
      caseThickness: "13.2 mm",
      caseMaterial: "316L Brushed & Polished Stainless Steel",
      crystal: "Domed Scratch-Resistant Sapphire with Anti-Reflective Treatment",
      caseback: "Sapphire Crystal Exhibition Caseback with Seahorse Medallion",
      waterResistance: "50 Meters / 5 ATM",
      strap: "Brushed 5-Arched-Links Stainless Steel Bracelet",
      clasp: "Comfort-Setting Foldover Clasp with Engraved Omega Logo"
    },
    colors: [
      { name: "Moonwatch Matte Black", hex: "#18181b", imageIndex: 0 }
    ],
    straps: [
      { name: "5-Link Steel Bracelet", id: "steel-5link" },
      { name: "NASA Velcro Flight Strap", id: "velcro" }
    ],
    badge: "Moonwatch Icon"
  },
  {
    id: "patek-nautilus-03",
    name: "Patek Philippe Nautilus 5711/1A",
    subtitle: "Horizontally Embossed Blue Sunburst Dial | Integrated Steel",
    brand: "Patek Philippe",
    category: "Skeletons",
    price: 5999,
    comparePrice: 7299,
    sku: "PP-NAU-5711-BLU",
    stock: 5,
    rating: 5.0,
    reviewsCount: 162,
    isLimited: true,
    isBestSeller: true,
    isNew: true,
    images: [
      "/images/watches/patek_nautilus.jpg"
    ],
    description: "The holy grail of luxury sports watches, originally designed by Gérald Genta in 1976. Rounded octagonal porthole bezel, horizontally embossed blue-black gradated dial, and exquisitely satin-brushed integrated bracelet.",
    specs: {
      movement: "Self-Winding Mechanical Calibre 26-330 S C (Geneva Seal)",
      powerReserve: "45 Hours (21K Gold Central Rotor)",
      caseDiameter: "40 mm",
      caseThickness: "8.3 mm (Ultra-Thin Profile)",
      caseMaterial: "Hand-Finished Surgical Grade Stainless Steel",
      crystal: "Beveled Anti-Reflective Sapphire Crystal",
      caseback: "Sapphire-Crystal Exhibition Caseback",
      waterResistance: "120 Meters / 12 ATM",
      strap: "Integrated Steel Nautilus Bracelet with Polished Center Links",
      clasp: "Nautilus Fold-Over Clasp with Safety Catch"
    },
    colors: [
      { name: "Blue Sunburst Dégradé", hex: "#1e3a8a", imageIndex: 0 }
    ],
    straps: [
      { name: "Integrated Steel Bracelet", id: "nautilus-steel" }
    ],
    badge: "Haute Horlogerie"
  },
  {
    id: "ap-royaloak-04",
    name: "Audemars Piguet Royal Oak 'Jumbo' 41mm",
    subtitle: "Grande Tapisserie Blue Dial | 8 Hexagonal Screws Bezel",
    brand: "Audemars Piguet",
    category: "Skeletons",
    price: 5899,
    comparePrice: 6999,
    sku: "AP-RO-41-TAP",
    stock: 6,
    rating: 4.9,
    reviewsCount: 88,
    isLimited: true,
    isBestSeller: true,
    isNew: false,
    images: [
      "/images/watches/audemars_royal_oak.jpg"
    ],
    description: "An icon that revolutionized luxury watchmaking. Featuring the unmistakable octagonal bezel secured by 8 polished white gold hexagonal screws, Bleu Nuit Nuage 50 Grande Tapisserie guilloché dial, and integrated bracelet.",
    specs: {
      movement: "Manufacture Calibre 4302 Self-Winding Automatic",
      powerReserve: "70 Hours",
      caseDiameter: "41 mm",
      caseThickness: "10.5 mm",
      caseMaterial: "Stainless Steel with Hand-Beveled Satin Finish",
      crystal: "Glareproofed Sapphire Crystal and Caseback",
      caseback: "See-Through Sapphire with 22K Pink Gold Oscillating Weight",
      waterResistance: "50 Meters / 5 ATM",
      strap: "Stainless Steel Bracelet with AP Folding Clasp",
      clasp: "AP Double-Blade Concealed Butterfly Clasp"
    },
    colors: [
      { name: "Bleu Nuit Tapisserie", hex: "#1e293b", imageIndex: 0 }
    ],
    straps: [
      { name: "Royal Oak Steel Bracelet", id: "ap-steel" }
    ],
    badge: "Royal Oak Icon"
  },
  {
    id: "cartier-santos-05",
    name: "Cartier Santos de Cartier Large",
    subtitle: "Silver Opaline Roman Dial | Blued Steel Hands & Exposed Screws",
    brand: "Cartier",
    category: "Diamond Editions",
    price: 4899,
    comparePrice: 5799,
    sku: "CAR-SAN-LM-STL",
    stock: 12,
    rating: 4.9,
    reviewsCount: 76,
    isLimited: false,
    isBestSeller: true,
    isNew: false,
    images: [
      "/images/watches/cartier_santos.jpg"
    ],
    description: "Created in 1904 for pioneer aviator Alberto Santos-Dumont, the Santos is the world's first modern wristwatch. Distinctive square case with rounded corners, exposed screws on bezel and bracelet, and seven-sided crown set with a faceted blue synthetic spinel.",
    specs: {
      movement: "Automatic Mechanical Calibre 1847 MC",
      powerReserve: "42 Hours (Anti-Magnetic to 1,200 Gauss)",
      caseDiameter: "39.8 mm (Large Model)",
      caseThickness: "9.38 mm",
      caseMaterial: "316L Stainless Steel with Polished Bezel",
      crystal: "Curved Sapphire Crystal with Anti-Scratch Finish",
      caseback: "Solid Steel Caseback with Engraved Santos de Cartier Monogram",
      waterResistance: "100 Meters / 10 ATM",
      strap: "Steel Bracelet with 'SmartLink' Resizing & 'QuickSwitch' Interchangeability",
      clasp: "Double Adjustable Folding Buckle"
    },
    colors: [
      { name: "Silver Opaline & Blued Steel", hex: "#e2e8f0", imageIndex: 0 }
    ],
    straps: [
      { name: "SmartLink Steel Bracelet", id: "santos-steel" },
      { name: "Calfskin Leather Strap", id: "santos-leather" }
    ],
    badge: "Cartier Maison"
  },
  {
    id: "tag-monaco-06",
    name: "TAG Heuer Monaco Calibre 11",
    subtitle: "Steve McQueen Edition | Metallic Blue Square Dial & Chronograph",
    brand: "TAG Heuer",
    category: "Chronographs",
    price: 4799,
    comparePrice: 5599,
    sku: "TAG-MON-39-BLU",
    stock: 8,
    rating: 4.8,
    reviewsCount: 65,
    isLimited: true,
    isBestSeller: false,
    isNew: true,
    images: [
      "/images/watches/tag_heuer_monaco.jpg"
    ],
    description: "The timeless racing chronograph made legendary by Steve McQueen in the 1971 motorsport classic 'Le Mans'. Famous left-sided crown, square 39mm case, striking metallic blue dial, and horizontal faceted hour markers.",
    specs: {
      movement: "Automatic Chronograph Calibre 11 (28,800 vph)",
      powerReserve: "40 Hours",
      caseDiameter: "39 mm x 39 mm Square",
      caseThickness: "14.3 mm",
      caseMaterial: "Fine-Brushed & Polished Stainless Steel",
      crystal: "Beveled Domed Sapphire Crystal",
      caseback: "Sapphire Crystal Exhibition Back with Engraved Calibre 11",
      waterResistance: "100 Meters / 10 ATM",
      strap: "Black Perforated Racing Calfskin Leather",
      clasp: "Steel Folding Clasp with Double Safety Push-Buttons"
    },
    colors: [
      { name: "Racing Petroleum Blue", hex: "#0369a1", imageIndex: 0 }
    ],
    straps: [
      { name: "Perforated Racing Leather", id: "monaco-rally" },
      { name: "Steel Mesh Bracelet", id: "monaco-steel" }
    ],
    badge: "Motorsport Legend"
  },
  {
    id: "breitling-navitimer-07",
    name: "Breitling Navitimer B01 Chronograph 43",
    subtitle: "Circular Aviation Slide Rule | Manufacture Calibre 01",
    brand: "Breitling",
    category: "Chronographs",
    price: 4999,
    comparePrice: 5899,
    sku: "BRT-NAV-43-B01",
    stock: 7,
    rating: 4.9,
    reviewsCount: 53,
    isLimited: false,
    isBestSeller: true,
    isNew: false,
    images: [
      "/images/watches/breitling_navitimer.jpg"
    ],
    description: "The world's most iconic pilot's chronograph since 1952. Equipped with the legendary circular slide rule for calculating flight plans, contrasting panda subdials, red chronograph second hand, and manufacture B01 movement.",
    specs: {
      movement: "Breitling Manufacture Calibre 01 (COSC Certified Chronometer)",
      powerReserve: "70 Hours",
      caseDiameter: "43 mm",
      caseThickness: "13.6 mm",
      caseMaterial: "Stainless Steel with Bidirectional Slide Rule Bezel",
      crystal: "Cambered Sapphire Glareproofed on Both Sides",
      caseback: "Screwed-in Sapphire Crystal Exhibition Caseback",
      waterResistance: "30 Meters / 3 ATM",
      strap: "7-Row Stainless Steel Navitimer Bracelet",
      clasp: "Steel Folding Buckle"
    },
    colors: [
      { name: "Panda Reverse Black", hex: "#111827", imageIndex: 0 }
    ],
    straps: [
      { name: "7-Row Navitimer Steel", id: "nav-steel" },
      { name: "Black Alligator Leather", id: "nav-leather" }
    ],
    badge: "Aviation Classic"
  },
  {
    id: "tissot-prx-08",
    name: "Tissot PRX Powermatic 80",
    subtitle: "Ice Blue Waffle Dial | 80-Hour Reserve Nivachron Balance",
    brand: "Tissot",
    category: "Automatics",
    price: 4499,
    comparePrice: 4999,
    sku: "TIS-PRX-40-ICE",
    stock: 18,
    rating: 4.9,
    reviewsCount: 142,
    isLimited: false,
    isBestSeller: true,
    isNew: true,
    images: [
      "/images/watches/tissot_prx.jpg"
    ],
    description: "The retro 1978 design sensation with modern horology technology. Integrated tonneau case with an ice blue embossed waffle dial, anti-magnetic Nivachron balance spring, and an astounding 80-hour power reserve.",
    specs: {
      movement: "Powermatic 80.111 Automatic (Nivachron Balance Spring)",
      powerReserve: "80 Hours",
      caseDiameter: "40 mm",
      caseThickness: "10.9 mm",
      caseMaterial: "316L Stainless Steel with Satin Finish",
      crystal: "Scratch-Resistant Sapphire Crystal",
      caseback: "Transparent Exhibition Mineral Glass Caseback",
      waterResistance: "100 Meters / 10 ATM",
      strap: "Integrated Single-Link Stainless Steel Bracelet",
      clasp: "Butterfly Clasp with Push-Buttons"
    },
    colors: [
      { name: "Glacier Ice Blue", hex: "#7dd3fc", imageIndex: 0 }
    ],
    straps: [
      { name: "Integrated Steel Bracelet", id: "prx-steel" },
      { name: "Textured Rubber Blue", id: "prx-rubber" }
    ],
    badge: "80h Power Reserve"
  },
  {
    id: "patek-tourbillon-09",
    name: "Patek Philippe Grand Complications Skeleton",
    subtitle: "Openworked Flying Tourbillon | 18K Rose Gold & Titanium Architecture",
    brand: "Patek Philippe",
    category: "Skeletons",
    price: 6499,
    comparePrice: 7999,
    sku: "PP-TRB-44-SKL",
    stock: 3,
    rating: 5.0,
    reviewsCount: 31,
    isLimited: true,
    isBestSeller: false,
    isNew: true,
    images: [
      "/images/watches/patek_tourbillon.jpg"
    ],
    description: "The ultimate pinnacle of mechanical micro-engineering. Openworked architectural bridges revealing hand-chamfered golden gears and a gravity-defying 60-second flying tourbillon cage at 6 o'clock.",
    specs: {
      movement: "Grand Complication Flying Tourbillon Calibre AK-900T",
      powerReserve: "72 Hours (Twin Barrels)",
      caseDiameter: "44 mm",
      caseThickness: "11.6 mm",
      caseMaterial: "18K Rose Gold & Grade 5 Titanium",
      crystal: "Double-Domed 7-Layer Anti-Reflective Sapphire",
      caseback: "Full Exhibition Skeleton Sapphire Caseback",
      waterResistance: "50 Meters / 5 ATM",
      strap: "Hand-Stitched Matte Black Alligator Leather",
      clasp: "Rose Gold Deployment Clasp with Calatrava Cross Emblem"
    },
    colors: [
      { name: "Rose Gold & Titanium Skeleton", hex: "#d4af37", imageIndex: 0 }
    ],
    straps: [
      { name: "Alligator Leather", id: "alligator-black" },
      { name: "Titanium Bracelet", id: "ti-bracelet" }
    ],
    badge: "Flying Tourbillon"
  }
];

export const CATEGORIES = [
  "All",
  "Rolex",
  "Omega",
  "Patek Philippe",
  "Audemars Piguet",
  "Cartier",
  "Chronographs",
  "Skeletons",
  "Dive & Sport"
];

export const SORT_OPTIONS = [
  { label: "Featured & Bestsellers", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Top Customer Rating", value: "rating" },
  { label: "New Acquisitions", value: "newest" }
];

export const INITIAL_REVIEWS = [
  {
    id: "rev-01",
    productId: "rolex-submariner-01",
    author: "Vikramaditya S. (Mumbai)",
    rating: 5,
    date: "2 days ago",
    title: "Masterpiece in hand - unmatched quality",
    comment: "The Rolex Submariner Date with the green bezel arrived in a heavy luxury wooden presentation vault. The weight, ceramic bezel click, and finishing are sensational for ₹5,499. Outstanding concierge delivery!",
    verified: true,
    avatar: "VS"
  },
  {
    id: "rev-02",
    productId: "omega-speedmaster-02",
    author: "Rohan Malhotra (New Delhi)",
    rating: 5,
    date: "5 days ago",
    title: "The iconic Moonwatch feel",
    comment: "Flawless chronograph action and crisp dial typography. Wearing this Omega Speedmaster makes you feel connected to horological history. Highly recommended!",
    verified: true,
    avatar: "RM"
  },
  {
    id: "rev-03",
    productId: "patek-nautilus-03",
    author: "Ananya Deshmukh (Bengaluru)",
    rating: 5,
    date: "1 week ago",
    title: "Patek Nautilus blue dial is mesmerizing",
    comment: "The blue horizontally embossed dial changes shades under sunlight. Fits like a glove on the wrist. Exceptional timepiece!",
    verified: true,
    avatar: "AD"
  }
];

export const INITIAL_ORDERS = [
  {
    id: "ORD-LW-98421",
    date: "2026-08-24T14:32:00Z",
    status: "Delivered",
    trackingNumber: "LW-IND-77892014",
    client: {
      name: "Sir Richard Vance",
      email: "r.vance@mayfairholdings.co.uk",
      phone: "+91 98200 45678",
      address: "14 Altamount Road, Cumballa Hill",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400026",
      country: "India"
    },
    items: [
      {
        id: "rolex-submariner-01",
        name: "Rolex Submariner Date 41mm",
        price: 5499,
        quantity: 1,
        selectedColor: "Emerald Green & Black",
        selectedStrap: "Oystersteel Solid Bracelet",
        engravingText: "VANCE • MMXXVI",
        image: "/images/watches/rolex_submariner.jpg"
      }
    ],
    subtotal: 5499,
    discountAmount: 550,
    couponApplied: "LUXE10",
    shippingCost: 0,
    shippingSpeed: "Armoured Express Concierge (Next Day)",
    total: 4949,
    paymentMethod: "UPI Instant (vance@oksbi)",
    notes: "Please deliver in velvet presentation case."
  }
];

export const INITIAL_COUPONS = [
  { code: "LUXE10", discountPercent: 10, minSpend: 4000, description: "10% off on all luxury brand timepieces" },
  { code: "ROYAL15", discountPercent: 15, minSpend: 8000, description: "15% VIP discount on orders above ₹8,000" },
  { code: "FIRSTTIME", discountPercent: 8, minSpend: 3000, description: "8% welcome reduction for new collectors" },
  { code: "DIAMOND20", discountPercent: 20, minSpend: 10000, description: "20% off for Connoisseurs ordering multiple watches" }
];

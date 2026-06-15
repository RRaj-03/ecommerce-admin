import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "../generated/prisma/client";

const url = process.env.DATABASE_URL!;
let prisma: PrismaClient;

if (url.startsWith("prisma://") || url.startsWith("prisma+postgres://")) {
  prisma = new PrismaClient({ accelerateUrl: url });
} else {
  const { PrismaPg } = require("@prisma/adapter-pg");
  prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
}

// ─── Fixed IDs ────────────────────────────────────────────────
const STORE_ID = "01ee763c-11f7-4cc5-b51e-0683726271a3";
const USER_ID = "ce3a0447-4ea3-47ae-a44d-ca317b9477cb";

const BB = {
  sofas: "rajvi-bb-sofas-000000001",
  beds: "rajvi-bb-beds-0000000002",
  mattresses: "rajvi-bb-mattress-000003",
};

const CAT = {
  sofaSets: "rajvi-cat-sofasets-0001",
  sofa3Seat: "rajvi-cat-sofa3s-00002",
  lSofas: "rajvi-cat-lsofa-000003",
  beds: "rajvi-cat-beds-000004",
  mattresses: "rajvi-cat-mattress-0005",
  sofaCum: "rajvi-cat-sofacum-0006",
};

const FIL = {
  material: "rajvi-fil-material-001",
  color: "rajvi-fil-color-00002",
};

const FI = {
  fabric: "rajvi-fi-fabric-00001",
  leather: "rajvi-fi-leather-0002",
  wood: "rajvi-fi-wood-000003",
  foam: "rajvi-fi-foam-000004",
  beige: "rajvi-fi-beige-00005",
  brown: "rajvi-fi-brown-00006",
  grey: "rajvi-fi-grey-000007",
  cream: "rajvi-fi-cream-00008",
  maroon: "rajvi-fi-maroon-0009",
  blue: "rajvi-fi-blue-000010",
};

const PROD = {
  p01: "rajvi-prod-0000000001",
  p02: "rajvi-prod-0000000002",
  p03: "rajvi-prod-0000000003",
  p04: "rajvi-prod-0000000004",
  p05: "rajvi-prod-0000000005",
  p06: "rajvi-prod-0000000006",
  p07: "rajvi-prod-0000000007",
  p08: "rajvi-prod-0000000008",
  p09: "rajvi-prod-0000000009",
  p10: "rajvi-prod-0000000010",
  p11: "rajvi-prod-0000000011",
  p12: "rajvi-prod-0000000012",
};

// ─── High-quality Unsplash images for each product type ────────
// All are professional furniture photography shots
const IMG = {
  sofa1: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&auto=format&fit=crop&q=85",
  ],
  sofa2: [
    "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=900&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1550254478-ead40cc54513?w=900&auto=format&fit=crop&q=85",
  ],
  sofa3: [
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&auto=format&fit=crop&q=85",
  ],
  sofaLeather: [
    "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=900&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=900&auto=format&fit=crop&q=85",
  ],
  lSofa1: [
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?w=900&auto=format&fit=crop&q=85",
  ],
  lSofa2: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=900&auto=format&fit=crop&q=85",
  ],
  sofaCum1: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&auto=format&fit=crop&q=85",
  ],
  bed1: [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900&auto=format&fit=crop&q=85",
  ],
  bed2: [
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=900&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&auto=format&fit=crop&q=85",
  ],
  bed3: [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=900&auto=format&fit=crop&q=85",
  ],
  mattress1: [
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&auto=format&fit=crop&q=85",
  ],
  mattress2: [
    "https://images.unsplash.com/photo-1550254478-ead40cc54513?w=900&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&auto=format&fit=crop&q=85",
  ],
};

async function main() {
  console.log("🌱 Seeding Rajvi Sofa & Bed Store...\n");

  // ─── 1. Store ──────────────────────────────────────────────────
  const store = await prisma.store.upsert({
    where: { id: STORE_ID },
    update: {},
    create: {
      id: STORE_ID,
      name: "Rajvi Sofa & Bed",
      userId: USER_ID,
      emailAddress: "rajvimattress@gmail.com",
      phoneNumber: "+91-9876543210",
      Address: "Ring Road, Katargam, Surat, Gujarat - 395004",
    },
  });
  console.log(`✅ Store: "${store.name}" (${store.id})`);

  // ─── 2. Billboards ─────────────────────────────────────────────
  const billboards = [
    {
      id: BB.sofas,
      label: "Premium Sofa Collection — Crafted for Comfort",
      imageURL:
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&auto=format&fit=crop&q=85",
    },
    {
      id: BB.beds,
      label: "Luxury Beds — Sleep Like Never Before",
      imageURL:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&auto=format&fit=crop&q=85",
    },
    {
      id: BB.mattresses,
      label: "Memory Foam & Spring Mattresses — Best Prices in Surat",
      imageURL:
        "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1400&auto=format&fit=crop&q=85",
    },
  ];

  for (const bb of billboards) {
    await prisma.billboard.upsert({
      where: { id: bb.id },
      update: {},
      create: { ...bb, storeId: STORE_ID },
    });
  }
  console.log(`✅ Billboards: ${billboards.length} created`);

  // ─── 3. Categories ─────────────────────────────────────────────
  const categories = [
    { id: CAT.sofaSets, name: "Sofa Sets", billboardId: BB.sofas },
    { id: CAT.sofa3Seat, name: "3-Seater Sofas", billboardId: BB.sofas },
    { id: CAT.lSofas, name: "L-Shape Sofas", billboardId: BB.sofas },
    { id: CAT.sofaCum, name: "Sofa Cum Bed", billboardId: BB.sofas },
    { id: CAT.beds, name: "Beds", billboardId: BB.beds },
    { id: CAT.mattresses, name: "Mattresses", billboardId: BB.mattresses },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: { ...cat, storeId: STORE_ID },
    });
  }
  console.log(`✅ Categories: ${categories.length} created`);

  // ─── 4. Filters ────────────────────────────────────────────────
  const filters = [
    { id: FIL.material, name: "Material" },
    { id: FIL.color, name: "Color" },
  ];
  for (const f of filters) {
    await prisma.filter.upsert({
      where: { id: f.id },
      update: {},
      create: { ...f, storeId: STORE_ID },
    });
  }
  console.log(`✅ Filters: ${filters.length} created`);

  // ─── 5. Filter Items ───────────────────────────────────────────
  const filterItems = [
    { id: FI.fabric, name: "Fabric", value: "Fabric", filterId: FIL.material },
    {
      id: FI.leather,
      name: "Leather",
      value: "Leather",
      filterId: FIL.material,
    },
    { id: FI.wood, name: "Wood", value: "Wood", filterId: FIL.material },
    { id: FI.foam, name: "Foam", value: "Foam", filterId: FIL.material },
    { id: FI.beige, name: "Beige", value: "#D9C9B0", filterId: FIL.color },
    { id: FI.brown, name: "Brown", value: "#7B4F2E", filterId: FIL.color },
    { id: FI.grey, name: "Grey", value: "#9E9E9E", filterId: FIL.color },
    { id: FI.cream, name: "Cream", value: "#FFFDD0", filterId: FIL.color },
    { id: FI.maroon, name: "Maroon", value: "#800000", filterId: FIL.color },
    { id: FI.blue, name: "Blue", value: "#3B5998", filterId: FIL.color },
  ];
  for (const fi of filterItems) {
    await prisma.filterItem.upsert({
      where: { id: fi.id },
      update: {},
      create: { ...fi, storeId: STORE_ID },
    });
  }
  console.log(`✅ Filter Items: ${filterItems.length} created`);

  // ─── 6. Products ───────────────────────────────────────────────
  const products = [
    // ── Sofa Sets ──
    {
      id: PROD.p01,
      name: "Rajvi Royal 5-Seater Fabric Sofa Set",
      price: 35000,
      compareAtPrice: 45000,
      categoryId: CAT.sofaSets,
      isFeatured: true,
      isArchived: false,
      inventory: 10,
      sku: "RSB-SS-FAB-001",
      description:
        "Elevate your living room with the Rajvi Royal 5-Seater Sofa Set. Upholstered in premium high-density fabric with a durable hardwood frame. Comes with matching cushions. Available in custom colours on order. Ideal for medium to large living rooms.\n\nSeat depth: 22 inches | Back height: 36 inches | Arm height: 26 inches",
      measurements:
        '3-Seater: 84"W × 34"D × 36"H\n2-Seater: 60"W × 34"D × 36"H\nCushion thickness: 5 inches foam',
      materialsAndCare:
        "Frame: Kiln-dried hardwood\nUpholstery: Premium woven fabric (polyester blend)\nFilling: High-density PU foam\n\nCare: Vacuum regularly. Spot clean with mild soap and water. Avoid direct sunlight.",
      tags: ["sofa", "5-seater", "fabric", "featured", "bestseller"],
      images: IMG.sofa1,
      filterItems: [FI.fabric, FI.beige],
    },
    {
      id: PROD.p02,
      name: "Rajvi Classic 3+1+1 Sofa Set — Brown Fabric",
      price: 32000,
      compareAtPrice: 42000,
      categoryId: CAT.sofaSets,
      isFeatured: true,
      isArchived: false,
      inventory: 8,
      sku: "RSB-SS-FAB-002",
      description:
        "A timeless 3+1+1 sofa set with a sturdy wooden frame and plush cushioning. The rich brown fabric complements any living room décor. Customisation available in size and colour. Made to order — 15–20 day delivery.\n\nAll pieces feature non-slip rubber feet to protect your flooring.",
      measurements:
        '3-Seater: 80"W × 32"D × 34"H\n1-Seater (each): 36"W × 32"D × 34"H',
      materialsAndCare:
        "Frame: Sheesham wood base\nUpholstery: Velvet-touch fabric\nFilling: Bonded foam + sinuous spring base\n\nCare: Professional dry-clean recommended for deep cleaning.",
      tags: ["sofa", "3+1+1", "fabric", "brown", "classic"],
      images: IMG.sofa2,
      filterItems: [FI.fabric, FI.brown],
    },
    // ── 3-Seater Sofas ──
    {
      id: PROD.p03,
      name: "Rajvi Comfort 3-Seater Sofa — Grey",
      price: 18500,
      compareAtPrice: 24000,
      categoryId: CAT.sofa3Seat,
      isFeatured: true,
      isArchived: false,
      inventory: 15,
      sku: "RSB-3S-FAB-003",
      description:
        "A versatile 3-seater sofa perfect for apartments and compact living rooms. The neutral grey tone pairs well with any colour palette. Deep seat cushions with high-resilience foam for long-lasting comfort.\n\nAvailable in Grey, Beige, Blue, and Maroon.",
      measurements:
        'Width: 78" | Depth: 33" | Height: 35"\nSeat height from floor: 18"',
      materialsAndCare:
        "Frame: Engineered wood + metal connectors\nUpholstery: Micro-fibre fabric\nFilling: HR foam 40 density\n\nCare: Use fabric protector spray. Spot clean with damp cloth.",
      tags: ["sofa", "3-seater", "grey", "compact"],
      images: IMG.sofa3,
      filterItems: [FI.fabric, FI.grey],
    },
    // ── L-Shape Sofas ──
    {
      id: PROD.p04,
      name: "Rajvi Luxe L-Shape Leather Sofa — Brown",
      price: 71000,
      compareAtPrice: 89000,
      categoryId: CAT.lSofas,
      isFeatured: true,
      isArchived: false,
      inventory: 5,
      sku: "RSB-LS-LEA-004",
      description:
        "Statement piece for any premium home. Full-grain leatherette upholstery with a modular design that can be configured left or right facing. Comes with 4 accent cushions. Solid wood legs in walnut finish.\n\nThis is our best-selling product — modular configuration available.",
      measurements:
        'Long side: 106" | Short side: 68" | Depth: 36" | Height: 34"\nChaise depth: 60"',
      materialsAndCare:
        "Frame: Solid hardwood\nUpholstery: Full-grain leatherette (PU leather)\nLegs: Solid walnut finish\n\nCare: Wipe with dry or slightly damp cloth. Use leather conditioner every 3–6 months. Avoid harsh chemicals.",
      tags: ["L-shape", "leather", "premium", "modular", "featured"],
      images: IMG.sofaLeather,
      filterItems: [FI.leather, FI.brown],
    },
    {
      id: PROD.p05,
      name: "Rajvi Modern L-Shape Sofa — Grey Fabric",
      price: 48000,
      compareAtPrice: 62000,
      categoryId: CAT.lSofas,
      isFeatured: false,
      isArchived: false,
      inventory: 7,
      sku: "RSB-LS-FAB-005",
      description:
        "Contemporary L-shape sofa in premium grey fabric. Deep-seated for maximum comfort. Modular sections can be rearranged. Ideal for large living rooms or home theatres.\n\nCustom upholstery available on order (15–20 days lead time).",
      measurements:
        'Long side: 98" | Short side: 60" | Depth: 38" | Seat height: 17"',
      materialsAndCare:
        "Frame: Kiln-dried mango wood\nUpholstery: Premium linen-blend fabric\nFilling: Pocket spring + HR foam",
      tags: ["L-shape", "fabric", "grey", "modern", "sectional"],
      images: IMG.lSofa1,
      filterItems: [FI.fabric, FI.grey],
    },
    // ── Sofa Cum Bed ──
    {
      id: PROD.p06,
      name: "Rajvi Convertible Sofa Cum Bed — Cream",
      price: 22000,
      compareAtPrice: 28000,
      categoryId: CAT.sofaCum,
      isFeatured: true,
      isArchived: false,
      inventory: 12,
      sku: "RSB-SCB-FAB-006",
      description:
        "The perfect space-saving solution. Converts from a stylish 3-seater sofa to a comfortable double bed in seconds. Pull-out mechanism with smooth metal rails. Includes a 4-inch foam mattress.\n\nIdeal for guest rooms, studio apartments, and home offices.",
      measurements:
        'Sofa mode: 78"W × 34"D × 36"H\nBed mode: 78"W × 54"D (full double size)\nMattress thickness: 4 inches',
      materialsAndCare:
        "Frame: Powder-coated steel + engineered wood\nUpholstery: Easy-clean microfiber fabric\nMattress: Foam\n\nCare: Spot clean only. Do not machine wash covers.",
      assembly:
        "Pull the seat cushion forward and lift the backrest to reveal the fold-out frame. The bed unfolds on smooth metal rails. Reverse to return to sofa mode.",
      tags: ["sofa-cum-bed", "convertible", "space-saving", "guest-room"],
      images: IMG.sofaCum1,
      filterItems: [FI.fabric, FI.cream],
    },
    // ── Beds ──
    {
      id: PROD.p07,
      name: "Rajvi King Size Storage Bed — Brown Walnut",
      price: 31000,
      compareAtPrice: 40000,
      categoryId: CAT.beds,
      isFeatured: true,
      isArchived: false,
      inventory: 8,
      sku: "RSB-BD-STG-007",
      description:
        'Stylish king-size bed with hydraulic storage mechanism. Lift the base to reveal a spacious storage compartment — perfect for extra linens and pillows. Solid walnut-finish headboard with upholstered back panel.\n\nMattress not included. Fits standard king-size mattress (72"×78").',
      measurements:
        'Outer: 84"W × 90"L × 42"H\nInner sleeping area: 72"W × 78"L\nStorage depth: 12 inches',
      materialsAndCare:
        "Frame: Engineered wood with walnut veneer\nHeadboard: MDF with upholstered fabric panel\nStorage: Hydraulic gas lift mechanism (rated 80 kg)\n\nCare: Wipe with dry cloth. Avoid moisture near wood edges.",
      assembly:
        "Assembled by our delivery team at no extra charge within Surat. Outside Surat — assembly charges applicable.",
      tags: ["bed", "king-size", "storage", "hydraulic", "bestseller"],
      images: IMG.bed1,
      filterItems: [FI.wood, FI.brown],
    },
    {
      id: PROD.p08,
      name: "Rajvi Queen Size Platform Bed — Grey",
      price: 22000,
      compareAtPrice: 29000,
      categoryId: CAT.beds,
      isFeatured: false,
      isArchived: false,
      inventory: 12,
      sku: "RSB-BD-PLT-008",
      description:
        'A sleek, low-profile platform bed with a padded headboard. The minimalist design fits modern and Scandinavian décor styles. Solid wood slat base — no box spring needed.\n\nFits standard queen mattress (60"×78").',
      measurements:
        'Outer: 70"W × 88"L × 36"H\nHeadboard height: 36" from floor',
      materialsAndCare:
        "Frame: Solid sheesham wood + MDF panels\nHeadboard: Upholstered in linen fabric\n\nCare: Vacuum headboard regularly. Wipe frame with dry cloth.",
      tags: ["bed", "queen-size", "platform", "minimalist"],
      images: IMG.bed2,
      filterItems: [FI.wood, FI.grey],
    },
    {
      id: PROD.p09,
      name: "Rajvi Luxury Upholstered Bed — Cream",
      price: 38000,
      compareAtPrice: 48000,
      categoryId: CAT.beds,
      isFeatured: true,
      isArchived: false,
      inventory: 6,
      sku: "RSB-BD-UPH-009",
      description:
        'Full upholstered bed with a button-tufted headboard for a luxurious hotel feel. Premium velvet fabric in a sophisticated cream tone. Solid wood frame with centre support leg for lasting durability.\n\nKing size (72"×78") and Queen size (60"×78") available.',
      measurements:
        'King outer: 84"W × 90"L × 50"H\nHeadboard height: 50" from floor',
      materialsAndCare:
        "Frame: Kiln-dried hardwood\nUpholstery: Premium velvet fabric\nButton tufting: Hand-sewn\n\nCare: Vacuum weekly. Professional steam-clean annually.",
      tags: ["bed", "upholstered", "luxury", "velvet", "featured"],
      images: IMG.bed3,
      filterItems: [FI.fabric, FI.cream],
    },
    // ── Mattresses ──
    {
      id: PROD.p10,
      name: "Rajvi Ortho Spring Mattress — 72×78 King",
      price: 15000,
      compareAtPrice: 20000,
      categoryId: CAT.mattresses,
      isFeatured: true,
      isArchived: false,
      inventory: 20,
      sku: "RSB-MT-SPR-010",
      description:
        "Orthopaedic spring mattress engineered for back support and pressure relief. Individually pocketed springs adapt to your body shape. 5-zone support system for head, shoulders, back, lumbar, and legs.\n\n10-year warranty. 30-night trial available in Surat.",
      measurements:
        '72"×78" (King) | Height: 8 inches\nAlso available: 60"×78" (Queen) | 72"×75" (Standard King)',
      materialsAndCare:
        'Core: Bonded steel pocket springs (800 springs)\nComfort layer: 1.5" memory foam\nCover: Quilted knit fabric with aloe vera treatment\n\nCare: Rotate every 3 months. Use mattress protector. Spot clean only.',
      tags: ["mattress", "spring", "ortho", "king-size"],
      images: IMG.mattress1,
      filterItems: [FI.foam, FI.cream],
    },
    {
      id: PROD.p11,
      name: "Rajvi Memory Foam Mattress — 60×78 Queen",
      price: 9500,
      compareAtPrice: 13000,
      categoryId: CAT.mattresses,
      isFeatured: false,
      isArchived: false,
      inventory: 25,
      sku: "RSB-MT-MEM-011",
      description:
        "High-density memory foam mattress that contours to your body for personalised support. Excellent motion isolation — perfect for couples. Breathable open-cell foam technology keeps you cool.\n\nAvailable in all standard sizes. Custom sizes on request.",
      measurements: '60"×78" (Queen) | Height: 6 inches\nDensity: 40 kg/m³',
      materialsAndCare:
        'Core: High-density polyurethane foam\nTop layer: 2" memory foam\nCover: Removable, washable bamboo-blend cover\n\nCare: Remove and wash cover monthly. Air mattress quarterly.',
      tags: ["mattress", "memory-foam", "queen", "cooling"],
      images: IMG.mattress2,
      filterItems: [FI.foam, FI.cream],
    },
    {
      id: PROD.p12,
      name: "Rajvi Mattress — Single Foam 36×78",
      price: 2800,
      compareAtPrice: 3800,
      categoryId: CAT.mattresses,
      isFeatured: false,
      isArchived: false,
      inventory: 40,
      sku: "RSB-MT-FOM-012",
      description:
        "Affordable and comfortable single-size foam mattress. Ideal for children's rooms, guest rooms, and student hostels. Medium-firm feel with a durable fabric cover.\n\nQuick delivery available across Surat and surrounding areas.",
      measurements: '36"×78" (Single) | Height: 4 inches\nWeight: ~8 kg',
      materialsAndCare:
        "Core: PU foam 32 density\nCover: Jacquard fabric\n\nCare: Spot clean only. Sun-dry quarterly.",
      tags: ["mattress", "single", "budget", "foam"],
      images: IMG.mattress1,
      filterItems: [FI.foam, FI.cream],
    },
  ];

  for (const product of products) {
    const { images, filterItems: fiIds, ...productData } = product;

    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        ...productData,
        storeId: STORE_ID,
      },
    });

    await prisma.image.deleteMany({ where: { productId: product.id } });
    for (const url of images) {
      await prisma.image.create({ data: { url, productId: product.id } });
    }

    await prisma.productOnFilterItem.deleteMany({
      where: { productId: product.id },
    });
    for (const fiId of fiIds) {
      await prisma.productOnFilterItem.create({
        data: { productId: product.id, filterItemId: fiId },
      });
    }
  }
  console.log(
    `✅ Products: ${products.length} created (with images & filters)`,
  );

  // ─── 7. Store image ────────────────────────────────────────────
  await prisma.image.deleteMany({
    where: { storeId: STORE_ID, productId: null },
  });
  await prisma.image.create({
    data: {
      url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&auto=format&fit=crop&q=85",
      storeId: STORE_ID,
    },
  });
  console.log(`✅ Store banner image created`);

  // ─── 8. Theme (Warm Earthy — fits a sofa/bed store) ───────────
  await prisma.storeTheme.upsert({
    where: { storeId: STORE_ID },
    update: {},
    create: {
      storeId: STORE_ID,
      preset: "warm",
      primaryColor: "28 80% 45%",
      secondaryColor: "20 60% 30%",
      accentColor: "35 95% 60%",
      backgroundColor: "36 50% 97%",
      foregroundColor: "20 40% 12%",
      mutedColor: "30 30% 92%",
      mutedForeground: "25 20% 40%",
      borderColor: "30 25% 85%",
      cardColor: "36 60% 99%",
      destructiveColor: "0 84.2% 60.2%",
      darkPrimary: "28 75% 55%",
      darkSecondary: "20 50% 20%",
      darkAccent: "35 90% 65%",
      darkBackground: "20 30% 7%",
      darkForeground: "30 30% 92%",
      darkMuted: "22 25% 14%",
      darkMutedFg: "28 15% 60%",
      darkBorder: "22 20% 18%",
      darkCard: "20 25% 9%",
      darkDestructive: "0 62.8% 30.6%",
      fontFamily: "Lato",
      headingFont: "Playfair Display",
      borderRadius: "0.5rem",
      productCardStyle: "default",
    },
  });
  console.log(`✅ Theme: Warm Earthy preset applied`);

  // ─── 9. Payment Config ─────────────────────────────────────────
  await prisma.paymentConfig.upsert({
    where: { storeId: STORE_ID },
    update: {},
    create: {
      storeId: STORE_ID,
      stripeEnabled: false,
      phonepeEnabled: false,
      codEnabled: true,
      codMinOrder: 1000,
      codMaxOrder: 100000,
      currency: "INR",
      taxRate: 18,
    },
  });
  console.log(`✅ Payment Config: COD enabled (INR, GST 18%)`);

  // ─── Done! ─────────────────────────────────────────────────────
  console.log("\n🎉 Rajvi Sofa & Bed store seeded successfully!\n");
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  Store: Rajvi Sofa & Bed                             ║");
  console.log("║  Store ID: " + STORE_ID + " ║");
  console.log("║                                                      ║");
  console.log("║  Update your ecommerce-store/.env.local:              ║");
  console.log(`║  NEXT_PUBLIC_API_URL=http://localhost:3000/api/${STORE_ID}`);
  console.log("╚══════════════════════════════════════════════════════╝");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

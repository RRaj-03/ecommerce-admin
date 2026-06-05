import { config } from "dotenv";
// Load .env.local first (higher priority), then .env as fallback
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Fixed UUIDs for deterministic seeding — makes it easy to reference in .env.local
const STORE_ID = "dev-store-00000000-0000-0000-0000-000000000001";
const USER_ID = "dev-user-local";

const BILLBOARD_IDS = {
  hero: "dev-billboard-hero-0001",
  sale: "dev-billboard-sale-0002",
  newArrivals: "dev-billboard-new-0003",
};

const CATEGORY_IDS = {
  chairs: "dev-category-chairs-001",
  tables: "dev-category-tables-002",
  lighting: "dev-category-lights-003",
};

const FILTER_IDS = {
  color: "dev-filter-color-0001",
  material: "dev-filter-material-02",
};

const FILTER_ITEM_IDS = {
  black: "dev-fi-black-000000001",
  white: "dev-fi-white-000000002",
  natural: "dev-fi-natural-0000003",
  wood: "dev-fi-wood-0000000004",
  metal: "dev-fi-metal-000000005",
  fabric: "dev-fi-fabric-00000006",
};

const PRODUCT_IDS = {
  chair1: "dev-product-chair1-001",
  chair2: "dev-product-chair2-002",
  table1: "dev-product-table1-003",
  table2: "dev-product-table2-004",
  lamp1: "dev-product-lamp1-0005",
  lamp2: "dev-product-lamp2-0006",
};

async function main() {
  console.log("🌱 Seeding database...\n");

  // ──────────────────────────────────────────
  // 1. Store
  // ──────────────────────────────────────────
  const store = await prisma.store.upsert({
    where: { id: STORE_ID },
    update: {},
    create: {
      id: STORE_ID,
      name: "Dev Furniture Store",
      userId: USER_ID,
      emailAddress: "dev@localhost.test",
      phoneNumber: "+1-555-0100",
      Address: "123 Dev Street, Localhost City",
    },
  });
  console.log(`✅ Store: "${store.name}" (${store.id})`);

  // ──────────────────────────────────────────
  // 2. Billboards
  // ──────────────────────────────────────────
  const billboards = [
    {
      id: BILLBOARD_IDS.hero,
      label: "Premium Furniture Collection",
      imageURL:
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=80",
    },
    {
      id: BILLBOARD_IDS.sale,
      label: "Summer Sale — Up to 40% Off",
      imageURL:
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80",
    },
    {
      id: BILLBOARD_IDS.newArrivals,
      label: "New Arrivals This Season",
      imageURL:
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&auto=format&fit=crop&q=80",
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

  // ──────────────────────────────────────────
  // 3. Categories
  // ──────────────────────────────────────────
  const categories = [
    {
      id: CATEGORY_IDS.chairs,
      name: "Chairs",
      billboardId: BILLBOARD_IDS.hero,
    },
    {
      id: CATEGORY_IDS.tables,
      name: "Tables",
      billboardId: BILLBOARD_IDS.sale,
    },
    {
      id: CATEGORY_IDS.lighting,
      name: "Lighting",
      billboardId: BILLBOARD_IDS.newArrivals,
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: { ...cat, storeId: STORE_ID },
    });
  }
  console.log(`✅ Categories: ${categories.length} created`);

  // ──────────────────────────────────────────
  // 4. Filters
  // ──────────────────────────────────────────
  const filters = [
    { id: FILTER_IDS.color, name: "Color" },
    { id: FILTER_IDS.material, name: "Material" },
  ];

  for (const f of filters) {
    await prisma.filter.upsert({
      where: { id: f.id },
      update: {},
      create: { ...f, storeId: STORE_ID },
    });
  }
  console.log(`✅ Filters: ${filters.length} created`);

  // ──────────────────────────────────────────
  // 5. Filter Items
  // ──────────────────────────────────────────
  const filterItems = [
    {
      id: FILTER_ITEM_IDS.black,
      name: "Black",
      value: "#000000",
      filterId: FILTER_IDS.color,
    },
    {
      id: FILTER_ITEM_IDS.white,
      name: "White",
      value: "#FFFFFF",
      filterId: FILTER_IDS.color,
    },
    {
      id: FILTER_ITEM_IDS.natural,
      name: "Natural",
      value: "#D4A574",
      filterId: FILTER_IDS.color,
    },
    {
      id: FILTER_ITEM_IDS.wood,
      name: "Wood",
      value: "Wood",
      filterId: FILTER_IDS.material,
    },
    {
      id: FILTER_ITEM_IDS.metal,
      name: "Metal",
      value: "Metal",
      filterId: FILTER_IDS.material,
    },
    {
      id: FILTER_ITEM_IDS.fabric,
      name: "Fabric",
      value: "Fabric",
      filterId: FILTER_IDS.material,
    },
  ];

  for (const fi of filterItems) {
    await prisma.filterItem.upsert({
      where: { id: fi.id },
      update: {},
      create: { ...fi, storeId: STORE_ID },
    });
  }
  console.log(`✅ Filter Items: ${filterItems.length} created`);

  // ──────────────────────────────────────────
  // 6. Products
  // ──────────────────────────────────────────
  const products = [
    {
      id: PRODUCT_IDS.chair1,
      name: "SANDSBERG Dining Chair",
      price: 2490,
      compareAtPrice: 3490,
      categoryId: CATEGORY_IDS.chairs,
      isFeatured: true,
      inventory: 25,
      description: "The clean, simple design is easy to place in any dining room. You can hang your bag on the hook underneath. The laminate surface is durable, easy to clean and can withstand heavy use.",
      sku: "CHAIR-SANDS-001",
      slug: "sandsberg-dining-chair",
      tags: ["dining", "modern", "bestseller"],
      images: [
        "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1503602642458-232111445657?w=800&auto=format&fit=crop&q=80",
      ],
      filterItems: [FILTER_ITEM_IDS.black, FILTER_ITEM_IDS.metal],
    },
    {
      id: PRODUCT_IDS.chair2,
      name: "ODGER Swivel Chair",
      price: 5990,
      compareAtPrice: 7990,
      categoryId: CATEGORY_IDS.chairs,
      isFeatured: true,
      inventory: 15,
      description: "Comfortable to sit on thanks to the bowl-shaped seat. The armrests support your elbows so you can relax. Easy to move around with its smooth swivel function.",
      sku: "CHAIR-ODGER-002",
      slug: "odger-swivel-chair",
      tags: ["office", "ergonomic", "swivel"],
      images: [
        "https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&auto=format&fit=crop&q=80",
      ],
      filterItems: [FILTER_ITEM_IDS.white, FILTER_ITEM_IDS.fabric],
    },
    {
      id: PRODUCT_IDS.table1,
      name: "MÖRBYLÅNGA Oak Table",
      price: 12990,
      categoryId: CATEGORY_IDS.tables,
      isFeatured: true,
      inventory: 8,
      description: "Every table is unique with varying grain pattern and natural colour shifts that are part of the charm of wood. Solid oak is a durable natural material that can be sanded and treated when needed.",
      sku: "TABLE-MORBY-003",
      slug: "morbylanga-oak-table",
      tags: ["dining", "premium", "solid-oak"],
      images: [
        "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=800&auto=format&fit=crop&q=80",
      ],
      filterItems: [FILTER_ITEM_IDS.natural, FILTER_ITEM_IDS.wood],
    },
    {
      id: PRODUCT_IDS.table2,
      name: "LISABO Side Table",
      price: 3490,
      categoryId: CATEGORY_IDS.tables,
      isFeatured: false,
      inventory: 30,
      images: [
        "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1499933374294-4584851497cc?w=800&auto=format&fit=crop&q=80",
      ],
      filterItems: [FILTER_ITEM_IDS.natural, FILTER_ITEM_IDS.wood],
    },
    {
      id: PRODUCT_IDS.lamp1,
      name: "HEKTAR Floor Lamp",
      price: 4990,
      categoryId: CATEGORY_IDS.lighting,
      isFeatured: true,
      inventory: 20,
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80",
      ],
      filterItems: [FILTER_ITEM_IDS.black, FILTER_ITEM_IDS.metal],
    },
    {
      id: PRODUCT_IDS.lamp2,
      name: "SINNERLIG Pendant Lamp",
      price: 7990,
      categoryId: CATEGORY_IDS.lighting,
      isFeatured: false,
      inventory: 12,
      images: [
        "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&auto=format&fit=crop&q=80",
      ],
      filterItems: [FILTER_ITEM_IDS.natural, FILTER_ITEM_IDS.fabric],
    },
  ];

  for (const product of products) {
    const { images, filterItems: fiIds, ...productData } = product;

    // Upsert product
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        ...productData,
        storeId: STORE_ID,
      },
    });

    // Create images (delete existing first for idempotency)
    await prisma.image.deleteMany({ where: { productId: product.id } });
    for (const url of images) {
      await prisma.image.create({
        data: {
          url,
          productId: product.id,
        },
      });
    }

    // Create filter item associations (delete existing first for idempotency)
    await prisma.productOnFilterItem.deleteMany({
      where: { productId: product.id },
    });
    for (const fiId of fiIds) {
      await prisma.productOnFilterItem.create({
        data: {
          productId: product.id,
          filterItemId: fiId,
        },
      });
    }
  }
  console.log(`✅ Products: ${products.length} created (with images & filters)`);

  // ──────────────────────────────────────────
  // 7. Sample Orders
  // ──────────────────────────────────────────
  const ORDER_IDS = {
    order1: "dev-order-00000000-0001",
    order2: "dev-order-00000000-0002",
  };

  const orders = [
    {
      id: ORDER_IDS.order1,
      firstName: "Dev",
      lastName: "User",
      phoneNumber: "+1-555-0100",
      emailAddress: "dev@localhost.test",
      userId: USER_ID,
      transactionId: "txn_dev_001",
      isPaid: true,
      phone: "+1-555-0100",
      address: "123 Dev St, Localhost City, LC, 00000, US",
      orderStatus: "Delivered",
      orderItems: [PRODUCT_IDS.chair1, PRODUCT_IDS.lamp1],
    },
    {
      id: ORDER_IDS.order2,
      firstName: "Test",
      lastName: "Customer",
      phoneNumber: "+1-555-0200",
      emailAddress: "test@localhost.test",
      userId: "test-user-002",
      transactionId: "txn_dev_002",
      isPaid: true,
      phone: "+1-555-0200",
      address: "456 Test Ave, Localhost City, LC, 00000, US",
      orderStatus: "Processing",
      orderItems: [PRODUCT_IDS.table1],
    },
  ];

  for (const order of orders) {
    const { orderItems: productIds, ...orderData } = order;

    await prisma.order.upsert({
      where: { id: order.id },
      update: {},
      create: {
        ...orderData,
        storeId: STORE_ID,
      },
    });

    // Create order items (delete existing first for idempotency)
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    for (const productId of productIds) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId,
        },
      });
    }
  }
  console.log(`✅ Orders: ${orders.length} created (with order items)`);

  // ──────────────────────────────────────────
  // 8. Store images
  // ──────────────────────────────────────────
  await prisma.image.deleteMany({ where: { storeId: STORE_ID, productId: null } });
  await prisma.image.create({
    data: {
      url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=80",
      storeId: STORE_ID,
    },
  });
  console.log(`✅ Store image created`);

  // ──────────────────────────────────────────
  // 9. Store Theme (Ocean preset)
  // ──────────────────────────────────────────
  await prisma.storeTheme.upsert({
    where: { storeId: STORE_ID },
    update: {},
    create: {
      storeId: STORE_ID,
      preset: "ocean",
      primaryColor: "189 94% 43%",
      secondaryColor: "196 64% 24%",
      accentColor: "187 92% 69%",
      backgroundColor: "183 100% 96%",
      foregroundColor: "198 80% 10%",
      mutedColor: "186 50% 92%",
      mutedForeground: "190 20% 40%",
      borderColor: "186 40% 86%",
      cardColor: "185 80% 98%",
      destructiveColor: "0 84.2% 60.2%",
      darkPrimary: "189 94% 43%",
      darkSecondary: "196 64% 14%",
      darkAccent: "187 85% 53%",
      darkBackground: "200 60% 5%",
      darkForeground: "186 40% 93%",
      darkMuted: "196 40% 12%",
      darkMutedFg: "190 20% 60%",
      darkBorder: "196 35% 15%",
      darkCard: "200 50% 7%",
      darkDestructive: "0 62.8% 30.6%",
      fontFamily: "DM Sans",
      headingFont: "Space Grotesk",
      borderRadius: "0.75rem",
      productCardStyle: "default",
    },
  });
  console.log(`✅ Theme: Ocean preset applied`);

  // ──────────────────────────────────────────
  // 10. Payment Config
  // ──────────────────────────────────────────
  await prisma.paymentConfig.upsert({
    where: { storeId: STORE_ID },
    update: {},
    create: {
      storeId: STORE_ID,
      stripeEnabled: true,
      phonepeEnabled: false,
      codEnabled: true,
      codMinOrder: 500,
      codMaxOrder: 10000,
      currency: "INR",
      taxRate: 18,
    },
  });
  console.log(`✅ Payment Config: Stripe + COD enabled`);

  // ──────────────────────────────────────────
  // 11. Order Status History
  // ──────────────────────────────────────────
  await prisma.orderStatusHistory.deleteMany({ where: { orderId: ORDER_IDS.order1 } });
  await prisma.orderStatusHistory.createMany({
    data: [
      { orderId: ORDER_IDS.order1, status: "Ordered", note: "Order placed", createdAt: new Date(Date.now() - 5 * 86400000) },
      { orderId: ORDER_IDS.order1, status: "Processing", note: "Payment confirmed", createdAt: new Date(Date.now() - 4 * 86400000) },
      { orderId: ORDER_IDS.order1, status: "Shipped", note: "Shipped via Delhivery: DL123456789", createdAt: new Date(Date.now() - 3 * 86400000) },
      { orderId: ORDER_IDS.order1, status: "Delivered", note: "Delivered to customer", createdAt: new Date(Date.now() - 1 * 86400000) },
    ],
  });

  // Update order1 with tracking info
  await prisma.order.update({
    where: { id: ORDER_IDS.order1 },
    data: {
      trackingNumber: "DL123456789",
      carrier: "Delhivery",
      trackingUrl: "https://www.delhivery.com/track/package/DL123456789",
      paymentMethod: "stripe",
    },
  });

  await prisma.orderStatusHistory.deleteMany({ where: { orderId: ORDER_IDS.order2 } });
  await prisma.orderStatusHistory.createMany({
    data: [
      { orderId: ORDER_IDS.order2, status: "Ordered", note: "Order placed", createdAt: new Date(Date.now() - 1 * 86400000) },
      { orderId: ORDER_IDS.order2, status: "Processing", note: "Preparing for shipment", createdAt: new Date() },
    ],
  });
  console.log(`✅ Order Status History seeded`);

  // ──────────────────────────────────────────
  // Done!
  // ──────────────────────────────────────────
  console.log("\n🎉 Seeding complete!\n");
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  Store ID: " + STORE_ID);
  console.log("║                                                      ║");
  console.log("║  Update your ecommerce-store/.env.local:              ║");
  console.log(`║  NEXT_PUBLIC_API_URL=http://localhost:3000/api/${STORE_ID}`);
  console.log(`║  NEXT_PUBLIC_API_STORE_URL=http://localhost:3000/api/stores/${STORE_ID}`);
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

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Demo/example tenant so there's something to click through immediately
// after `npm run db:setup` — real tenants come from the public /signup flow.
const DEMO_SLUG = "joes-cafe";
const DEMO_BUSINESS_NAME = "Joe's Cafe";
const DEMO_ADMIN_EMAIL = "owner@joescafe.example";
const DEMO_ADMIN_PASSWORD = "demopass123";

const CATEGORY_ITEMS: Record<
  string,
  { name: string; price: number; description?: string }[]
> = {
  Breakfast: [
    { name: "Classic Breakfast Plate", price: 11, description: "Eggs, toast, hash browns, bacon" },
    { name: "Avocado Toast", price: 9, description: "Sourdough, smashed avocado, chili flakes" },
    { name: "Buttermilk Pancakes", price: 8, description: "Stack of three, maple syrup" },
    { name: "Breakfast Burrito", price: 10 },
  ],
  Sandwiches: [
    { name: "Ham & Cheese Toastie", price: 8 },
    { name: "Turkey Club", price: 10 },
    { name: "Grilled Cheese", price: 7 },
    { name: "BLT", price: 9 },
    { name: "Egg & Bacon Roll", price: 7.5 },
  ],
  Salads: [
    { name: "Caesar Salad", price: 9 },
    { name: "Greek Salad", price: 9.5 },
    { name: "Garden Salad", price: 7 },
  ],
  Mains: [
    { name: "Grilled Chicken Rice Bowl", price: 12 },
    { name: "Veggie Stir-fry Noodles", price: 11 },
    { name: "Beef Chili", price: 13 },
  ],
  Sides: [
    { name: "Hash Browns", price: 4 },
    { name: "Side Salad", price: 4.5 },
    { name: "French Fries", price: 4 },
    { name: "Fruit Cup", price: 4 },
  ],
  Drinks: [
    { name: "Drip Coffee (S)", price: 3 },
    { name: "Drip Coffee (L)", price: 4 },
    { name: "Latte (S)", price: 4.5 },
    { name: "Latte (L)", price: 5.5 },
    { name: "Orange Juice", price: 4 },
    { name: "Iced Tea", price: 3 },
  ],
};

const CATEGORY_ORDER = Object.keys(CATEGORY_ITEMS);

async function main() {
  console.log("Seeding demo data...");

  const tenant = await prisma.tenant.upsert({
    where: { slug: DEMO_SLUG },
    update: {},
    create: { slug: DEMO_SLUG, businessName: DEMO_BUSINESS_NAME },
  });

  const branches = await Promise.all(
    [
      {
        name: "Downtown",
        address: "100 Market St, Springfield",
        phone: "555-0100",
        hours: "7:00 AM - 3:00 PM",
      },
      {
        name: "Uptown",
        address: "50 Main Ave, Springfield",
        phone: "555-0150",
        hours: "7:00 AM - 3:00 PM",
      },
    ].map((b) =>
      prisma.branch.upsert({
        where: { tenantId_name: { tenantId: tenant.id, name: b.name } },
        update: {},
        create: { ...b, tenantId: tenant.id },
      })
    )
  );

  const existingItemCount = await prisma.menuItem.count({ where: { tenantId: tenant.id } });
  if (existingItemCount === 0) {
    for (let i = 0; i < CATEGORY_ORDER.length; i++) {
      const categoryName = CATEGORY_ORDER[i];
      const category = await prisma.menuCategory.upsert({
        where: { tenantId_name: { tenantId: tenant.id, name: categoryName } },
        update: { sortOrder: i },
        create: { tenantId: tenant.id, name: categoryName, sortOrder: i },
      });

      const items = CATEGORY_ITEMS[categoryName];
      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        await prisma.menuItem.create({
          data: {
            tenantId: tenant.id,
            categoryId: category.id,
            name: item.name,
            price: item.price,
            description: item.description,
            sortOrder: j,
          },
        });
      }
    }
  }

  const pickupSlots = ["11:30 - 12:00", "12:00 - 12:30", "12:30 - 13:00", "13:00 - 13:30"];
  const deliverySlots = ["12:00 - 12:30", "12:30 - 13:00", "13:00 - 13:30"];

  for (const branch of branches) {
    for (let i = 0; i < pickupSlots.length; i++) {
      const label = pickupSlots[i];
      const existing = await prisma.timeSlot.findFirst({
        where: { branchId: branch.id, method: "PICKUP", label },
      });
      if (!existing) {
        await prisma.timeSlot.create({
          data: { tenantId: tenant.id, branchId: branch.id, method: "PICKUP", label, sortOrder: i },
        });
      }
    }
    for (let i = 0; i < deliverySlots.length; i++) {
      const label = deliverySlots[i];
      const existing = await prisma.timeSlot.findFirst({
        where: { branchId: branch.id, method: "DELIVERY", label },
      });
      if (!existing) {
        await prisma.timeSlot.create({
          data: { tenantId: tenant.id, branchId: branch.id, method: "DELIVERY", label, sortOrder: i },
        });
      }
    }
  }

  const passwordHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 10);
  await prisma.adminUser.upsert({
    where: { email: DEMO_ADMIN_EMAIL },
    update: {},
    create: { tenantId: tenant.id, email: DEMO_ADMIN_EMAIL, passwordHash },
  });

  console.log("Demo data ready!");
  console.log(`Demo site: /${DEMO_SLUG}`);
  console.log(`Demo admin login: ${DEMO_ADMIN_EMAIL} / ${DEMO_ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

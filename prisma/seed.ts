import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// NOTE: prices below are PLACEHOLDERS — the owner sent item names/categories
// but not the actual price list, so these are reasonable guesses to keep the
// demo usable. Correct them anytime from 菜單管理 in the admin backend.
const CATEGORY_ITEMS: Record<
  string,
  { name: string; price: number; description?: string }[]
> = {
  套餐: [
    { name: "單層厚片+餐點", price: 79, description: "日安家套餐" },
    { name: "蘿蔔糕+拌珍珠麵", price: 89, description: "日安家套餐" },
    { name: "花生蘿蔔糕吐司", price: 85, description: "日安家套餐" },
    { name: "卡拉雞腿蘿蔔薯", price: 99, description: "日安家套餐" },
    { name: "花生牛肉吐司捲", price: 95, description: "日安家套餐" },
  ],
  蛋餅: [
    { name: "原味蛋餅", price: 30 },
    { name: "起司蛋餅", price: 40 },
    { name: "鮪魚蛋餅", price: 45 },
    { name: "培根蛋餅", price: 45 },
    { name: "玉米蛋餅", price: 40 },
    { name: "火腿蛋餅", price: 40 },
    { name: "泡菜蛋餅", price: 40 },
    { name: "卡拉雞腿蘿蔔餅", price: 55 },
  ],
  吐司夾點: [
    { name: "鮪魚吐司", price: 45 },
    { name: "培根吐司", price: 45 },
    { name: "火腿吐司", price: 40 },
    { name: "起司吐司", price: 40 },
    { name: "玉米吐司", price: 40 },
    { name: "總匯吐司", price: 55 },
    { name: "卡拉雞腿吐司", price: 55 },
    { name: "黃金豬排吐司", price: 60 },
  ],
  麵食: [
    { name: "蕃茄蛋麵", price: 55 },
    { name: "泡菜麵", price: 55 },
    { name: "滷肉麵", price: 50 },
    { name: "蔥爆豬肉麵", price: 65 },
    { name: "蔥爆雞肉麵", price: 65 },
    { name: "番茄豬肉麵", price: 65 },
  ],
  飯食: [
    { name: "滷肉飯", price: 50 },
    { name: "番茄蛋炒飯", price: 55 },
    { name: "泡菜炒飯", price: 55 },
    { name: "蔥爆肉炒飯", price: 65 },
  ],
  小食拼盤: [
    { name: "薯餅", price: 25 },
    { name: "熱狗", price: 30 },
    { name: "小湯豆", price: 30 },
    { name: "小雞塊", price: 40 },
    { name: "培根", price: 35 },
    { name: "玉米", price: 30 },
    { name: "起司", price: 30 },
    { name: "鮪魚", price: 35 },
    { name: "火腿", price: 30 },
    { name: "黃金豬排", price: 45 },
    { name: "卡拉雞腿蘿蔔餅", price: 45 },
    { name: "乳酪丹麥", price: 40 },
  ],
  飲品: [
    { name: "紅茶 (M)", price: 15 },
    { name: "紅茶 (L)", price: 20 },
    { name: "綠茶 (M)", price: 15 },
    { name: "綠茶 (L)", price: 20 },
    { name: "奶茶 (M)", price: 25 },
    { name: "奶茶 (L)", price: 30 },
    { name: "豆漿 (M)", price: 20 },
    { name: "豆漿 (L)", price: 25 },
    { name: "鮮奶茶 (M)", price: 35 },
    { name: "鮮奶茶 (L)", price: 45 },
    { name: "財神奶茶 (M)", price: 40 },
    { name: "財神奶茶 (L)", price: 50 },
    { name: "美式咖啡 (M)", price: 35 },
    { name: "美式咖啡 (L)", price: 45 },
    { name: "拿鐵咖啡 (M)", price: 45 },
    { name: "拿鐵咖啡 (L)", price: 55 },
    { name: "綠果纖蔬 (M)", price: 40 },
    { name: "綠果纖蔬 (L)", price: 50 },
  ],
};

const CATEGORY_ORDER = Object.keys(CATEGORY_ITEMS);

async function main() {
  console.log("開始建立示範資料...");

  const branches = await Promise.all(
    [
      {
        name: "中山店",
        address: "台北市中山區中山北路二段 100 號",
        phone: "02-2521-1234",
        hours: "06:00 - 14:00",
      },
      {
        name: "信義店",
        address: "台北市信義區松仁路 50 號",
        phone: "02-2758-5678",
        hours: "06:00 - 14:00",
      },
    ].map((b) =>
      prisma.branch.upsert({
        where: { name: b.name },
        update: {},
        create: b,
      })
    )
  );

  // Only populate the menu when the database has none yet. This makes the seed
  // safe to run on every deploy (e.g. from the Vercel build) without ever
  // wiping the admin's availability toggles or any live data.
  const existingItemCount = await prisma.menuItem.count();
  if (existingItemCount === 0) {
    for (let i = 0; i < CATEGORY_ORDER.length; i++) {
      const categoryName = CATEGORY_ORDER[i];
      const category = await prisma.menuCategory.upsert({
        where: { name: categoryName },
        update: { sortOrder: i },
        create: { name: categoryName, sortOrder: i },
      });

      const items = CATEGORY_ITEMS[categoryName];
      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        await prisma.menuItem.create({
          data: {
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
          data: { branchId: branch.id, method: "PICKUP", label, sortOrder: i },
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
          data: { branchId: branch.id, method: "DELIVERY", label, sortOrder: i },
        });
      }
    }
  }

  const adminUsername = "admin";
  const adminPassword = "fufu2026";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { username: adminUsername },
    update: {},
    create: { username: adminUsername, passwordHash },
  });

  console.log("示範資料建立完成！");
  console.log(`管理後台登入帳號：${adminUsername} / 密碼：${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

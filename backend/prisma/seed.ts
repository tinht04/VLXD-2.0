import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed Products
  const products = [
    { name: "Xi măng Hà Tiên", unit: "Bao", price: 90000, category: "Xi măng" },
    { name: "Cát xây tô", unit: "Khối", price: 450000, category: "Cát/Đá" },
    { name: "Gạch ống 4 lỗ", unit: "Viên", price: 1200, category: "Gạch" },
    { name: "Sơn Dulux Trắng", unit: "Thùng", price: 1250000, category: "Sơn" },
    {
      name: "Ống nhựa Bình Minh ø27",
      unit: "Mét",
      price: 15000,
      category: "Ống nước",
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product,
    });
  }

  console.log("✅ Products seeded");

  // Seed Customers
  const customers = [
    { name: "Anh Hùng (Thầu)", phone: "0901234567", address: "Quận 9" },
    { name: "Chị Lan (Nhà Dân)", phone: "0912345678", address: "Thủ Đức" },
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { phone: customer.phone },
      update: {},
      create: customer,
    });
  }

  console.log("✅ Customers seeded");
  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

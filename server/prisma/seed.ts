import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ─── Users ───────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@billiard.com' },
    update: {},
    create: { email: 'admin@billiard.com', password: adminPassword, name: 'Administrator', role: 'ADMIN' },
  });

  const staffPassword = await bcrypt.hash('staff123', 10);
  await prisma.user.upsert({
    where: { email: 'staff@billiard.com' },
    update: {},
    create: { email: 'staff@billiard.com', password: staffPassword, name: 'Xodim', role: 'STAFF' },
  });

  // ─── Tables ──────────────────────────────────────────────────────────────
  const tables = [
    { name: 'Stol Alfa',    number: 1, hourlyPrice: 20000, nightPrice: 30000 },
    { name: 'Stol Bravo',   number: 2, hourlyPrice: 20000, nightPrice: 30000 },
    { name: 'Stol Charlie', number: 3, hourlyPrice: 25000, nightPrice: 35000 },
    { name: 'Stol Delta',   number: 4, hourlyPrice: 25000, nightPrice: 35000 },
  ];
  for (const t of tables) {
    await prisma.table.upsert({ where: { number: t.number }, update: {}, create: t });
  }

  // ─── Products ────────────────────────────────────────────────────────────
  const drinks = await prisma.category.upsert({
    where: { id: 1 }, update: {}, create: { name: 'Ichimliklar' },
  });
  const snacks = await prisma.category.upsert({
    where: { id: 2 }, update: {}, create: { name: 'Gazaklar' },
  });

  const products = [
    { name: 'Suv',          price: 2000,  categoryId: drinks.id },
    { name: 'Cola',         price: 5000,  categoryId: drinks.id },
    { name: 'Energy Drink', price: 8000,  categoryId: drinks.id },
    { name: 'Qahva',        price: 6000,  categoryId: drinks.id },
    { name: 'Chips',        price: 4000,  categoryId: snacks.id },
    { name: 'Sendvich',     price: 10000, categoryId: snacks.id },
    { name: 'Shokolad',     price: 3000,  categoryId: snacks.id },
  ];
  for (const p of products) {
    await prisma.product.create({ data: p }).catch(() => {});
  }

  // ─── Sample Customers ────────────────────────────────────────────────────
  const customers = [
    { name: 'Alisher Toshmatov', phone: '+998901234567', bonusBalance: 15000 },
    { name: 'Bobur Rahimov',     phone: '+998907654321', bonusBalance: 8500  },
    { name: 'Dilnoza Yusupova',  phone: '+998991112233', bonusBalance: 0     },
  ];
  for (const c of customers) {
    const existing = await prisma.customer.findUnique({ where: { phone: c.phone } });
    if (!existing) {
      const created = await prisma.customer.create({ data: { ...c, cardNumber: 'TEMP' } });
      await prisma.customer.update({
        where: { id: created.id },
        data: { cardNumber: `LC-${created.id.toString().padStart(8, '0')}` },
      });
    }
  }

  // ─── Business Settings (singleton id=1) ──────────────────────────────────
  await prisma.businessSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, cashbackPercent: 5, dayHourlyPrice: 40000, nightHourlyPrice: 50000, dayStartTime: '06:00', nightStartTime: '18:00' },
  });

  console.log('Seed yakunlandi.');
  console.log('Admin: admin@billiard.com / admin123');
  console.log('Xodim: staff@billiard.com / staff123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

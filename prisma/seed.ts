import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@billiard.com' },
    update: {},
    create: {
      email: 'admin@billiard.com',
      password: adminPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  const staffPassword = await bcrypt.hash('staff123', 10);
  await prisma.user.upsert({
    where: { email: 'staff@billiard.com' },
    update: {},
    create: {
      email: 'staff@billiard.com',
      password: staffPassword,
      name: 'Staff Member',
      role: 'STAFF',
    },
  });

  const tables = [
    { name: 'Table Alpha', number: 1, hourlyPrice: 20, nightPrice: 30 },
    { name: 'Table Bravo', number: 2, hourlyPrice: 20, nightPrice: 30 },
    { name: 'Table Charlie', number: 3, hourlyPrice: 25, nightPrice: 35 },
    { name: 'Table Delta', number: 4, hourlyPrice: 25, nightPrice: 35 },
  ];

  for (const t of tables) {
    await prisma.table.upsert({
      where: { number: t.number },
      update: {},
      create: t,
    });
  }

  const drinksCategory = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Drinks' },
  });

  const snacksCategory = await prisma.category.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Snacks' },
  });

  const products = [
    { name: 'Water', price: 2, categoryId: drinksCategory.id },
    { name: 'Cola', price: 3, categoryId: drinksCategory.id },
    { name: 'Energy Drink', price: 5, categoryId: drinksCategory.id },
    { name: 'Coffee', price: 4, categoryId: drinksCategory.id },
    { name: 'Chips', price: 3, categoryId: snacksCategory.id },
    { name: 'Sandwich', price: 6, categoryId: snacksCategory.id },
    { name: 'Chocolate Bar', price: 2, categoryId: snacksCategory.id },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p }).catch(() => {});
  }

  console.log('Seed complete.');
  console.log('Admin: admin@billiard.com / admin123');
  console.log('Staff: staff@billiard.com / staff123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

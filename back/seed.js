const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();
const prisma = new PrismaClient();

async function main(){
  const adminEmail = 'admin@example.com';
  const exists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!exists) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: await bcrypt.hash('admin123', 10),
        role: Role.ADMIN
      }
    });
    console.log('Seeded admin@example.com / admin123');
  } else {
    console.log('Admin already exists');
  }
}
main().finally(()=>prisma.$disconnect());

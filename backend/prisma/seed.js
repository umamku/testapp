const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@lembagaquran.id' },
    update: {},
    create: {
      name: 'Admin Lembaga Qur\'an',
      email: 'admin@lembagaquran.id',
      phone: '08123456789',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Seed programs
  const programs = [
    {
      name: "Kelas Iqro' (Anak)",
      description:
        "Program belajar membaca Al-Qur'an dengan metode Iqro' untuk anak-anak usia 5–12 tahun. Dimulai dari pengenalan huruf hijaiyah hingga lancar membaca Al-Qur'an.",
      schedule: 'Senin, Rabu, Jumat | 16:00 – 17:00 WIB',
      fee: 150000,
      capacity: 20,
    },
    {
      name: 'Tahsin Dewasa',
      description:
        "Program perbaikan bacaan Al-Qur'an untuk dewasa. Fokus pada tajwid, makhrajul huruf, dan fashahah bacaan agar sesuai kaidah yang benar.",
      schedule: 'Selasa, Kamis | 19:00 – 20:30 WIB',
      fee: 200000,
      capacity: 15,
    },
    {
      name: 'Program Tahfidz',
      description:
        "Program menghafal Al-Qur'an dengan target minimal 1 juz per bulan. Dibimbing oleh hafidz/hafidzah berpengalaman dengan metode muroja'ah terstruktur.",
      schedule: 'Setiap Hari | 07:00 – 09:00 WIB',
      fee: 350000,
      capacity: 10,
    },
    {
      name: "Al-Qur'an Remaja",
      description:
        "Program khusus remaja usia 13–18 tahun yang menggabungkan tahsin dan pemahaman makna Al-Qur'an dengan pendekatan interaktif dan menyenangkan.",
      schedule: 'Sabtu, Minggu | 08:00 – 10:00 WIB',
      fee: 250000,
      capacity: 20,
    },
  ];

  for (const program of programs) {
    await prisma.program.upsert({
      where: { name: program.name },
      update: {},
      create: program,
    });
  }

  console.log('✅ Seed selesai!');
  console.log('📧 Admin: admin@lembagaquran.id');
  console.log('🔑 Password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

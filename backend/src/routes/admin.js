const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Dashboard statistik
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  const [total, pending, paymentVerified, placementScheduled, accepted, rejected, programCount, userCount] =
    await Promise.all([
      prisma.registration.count(),
      prisma.registration.count({ where: { status: 'PENDING' } }),
      prisma.registration.count({ where: { status: 'PAYMENT_VERIFIED' } }),
      prisma.registration.count({ where: { status: 'PLACEMENT_SCHEDULED' } }),
      prisma.registration.count({ where: { status: 'ACCEPTED' } }),
      prisma.registration.count({ where: { status: 'REJECTED' } }),
      prisma.program.count(),
      prisma.user.count({ where: { role: 'SANTRI' } }),
    ]);

  const programStats = await prisma.program.findMany({
    select: { id: true, name: true, _count: { select: { registrations: true } } },
  });

  const recentRegistrations = await prisma.registration.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: {
      program: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
  });

  res.json({
    total,
    pending,
    paymentVerified,
    placementScheduled,
    accepted,
    rejected,
    programCount,
    userCount,
    programStats,
    recentRegistrations,
  });
});

// Get all registrations
router.get('/registrations', authenticate, requireAdmin, async (req, res) => {
  const { status, programId, search } = req.query;
  const where = {};
  if (status) where.status = status;
  if (programId) where.programId = programId;
  if (search) {
    where.OR = [
      { santriName: { contains: search } },
      { parentName: { contains: search } },
      { parentPhone: { contains: search } },
    ];
  }

  const registrations = await prisma.registration.findMany({
    where,
    include: {
      program: { select: { name: true } },
      user: { select: { name: true, email: true, phone: true } },
      placementTest: true,
      classAssignment: { include: { class: { select: { name: true, teacherName: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(registrations);
});

// Update registration status
router.patch('/registrations/:id/status', authenticate, requireAdmin, async (req, res) => {
  const { status, adminNotes } = req.body;
  const valid = ['PENDING', 'PAYMENT_VERIFIED', 'PLACEMENT_SCHEDULED', 'ACCEPTED', 'REJECTED'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Status tidak valid' });

  const registration = await prisma.registration.update({
    where: { id: req.params.id },
    data: { status, adminNotes },
    include: {
      program: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
  });
  res.json(registration);
});

// Schedule placement test
router.post('/registrations/:id/placement-test', authenticate, requireAdmin, async (req, res) => {
  const { scheduledDate, method, notes } = req.body;
  if (!scheduledDate || !method) {
    return res.status(400).json({ message: 'Tanggal dan metode tes wajib diisi' });
  }

  await prisma.registration.update({
    where: { id: req.params.id },
    data: { status: 'PLACEMENT_SCHEDULED' },
  });

  const test = await prisma.placementTest.upsert({
    where: { registrationId: req.params.id },
    update: { scheduledDate, method, notes },
    create: { registrationId: req.params.id, scheduledDate, method, notes },
  });
  res.json(test);
});

// Update placement test result
router.patch('/placement-tests/:id', authenticate, requireAdmin, async (req, res) => {
  const { result, score, notes } = req.body;
  const test = await prisma.placementTest.update({
    where: { id: req.params.id },
    data: { result, score: score != null ? parseInt(score) : null, notes },
  });
  res.json(test);
});

// Get all santri users
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  const users = await prisma.user.findMany({
    where: { role: 'SANTRI' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: { select: { registrations: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

// Export registrations as CSV
router.get('/export', authenticate, requireAdmin, async (req, res) => {
  const { status } = req.query;
  const where = status ? { status } : {};

  const registrations = await prisma.registration.findMany({
    where,
    include: {
      program: { select: { name: true } },
      user: { select: { email: true, phone: true } },
      classAssignment: { include: { class: { select: { name: true, teacherName: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const header = 'No,Nama Santri,Jenis Kelamin,Tanggal Lahir,Alamat,Pendidikan,Nama Orang Tua,No WA,Program,Status,Kelas,Ustaz/ah,Tanggal Daftar\n';
  const rows = registrations
    .map((r, i) =>
      [
        i + 1,
        r.santriName,
        r.santriGender,
        r.santriDOB,
        `"${r.santriAddress}"`,
        r.education,
        r.parentName,
        r.parentPhone,
        r.program.name,
        r.status,
        r.classAssignment?.class?.name || '-',
        r.classAssignment?.class?.teacherName || '-',
        new Date(r.createdAt).toLocaleDateString('id-ID'),
      ].join(',')
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="data-santri.csv"');
  res.send('\uFEFF' + header + rows); // BOM for Excel UTF-8
});

module.exports = router;

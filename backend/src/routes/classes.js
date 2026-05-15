const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all classes
router.get('/', authenticate, requireAdmin, async (req, res) => {
  const classes = await prisma.class.findMany({
    include: {
      program: { select: { name: true } },
      _count: { select: { assignments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(classes);
});

// Get class detail with students
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  const cls = await prisma.class.findUnique({
    where: { id: req.params.id },
    include: {
      program: true,
      assignments: {
        include: {
          registration: {
            include: { user: { select: { name: true, email: true, phone: true } } },
          },
        },
      },
    },
  });
  if (!cls) return res.status(404).json({ message: 'Kelas tidak ditemukan' });
  res.json(cls);
});

// Create class
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, programId, teacherName, schedule, capacity } = req.body;
  if (!name || !programId || !teacherName || !schedule || !capacity) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }
  const cls = await prisma.class.create({
    data: { name, programId, teacherName, schedule, capacity: parseInt(capacity) },
    include: { program: { select: { name: true } } },
  });
  res.status(201).json(cls);
});

// Update class
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, teacherName, schedule, capacity } = req.body;
  const cls = await prisma.class.update({
    where: { id: req.params.id },
    data: { name, teacherName, schedule, capacity: parseInt(capacity) },
  });
  res.json(cls);
});

// Delete class
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.class.delete({ where: { id: req.params.id } });
  res.json({ message: 'Kelas dihapus' });
});

// Assign student to class
router.post('/:id/assign', authenticate, requireAdmin, async (req, res) => {
  const { registrationId } = req.body;
  if (!registrationId) return res.status(400).json({ message: 'registrationId wajib diisi' });

  const existing = await prisma.classAssignment.findUnique({ where: { registrationId } });
  if (existing) {
    const updated = await prisma.classAssignment.update({
      where: { registrationId },
      data: { classId: req.params.id },
    });
    await prisma.registration.update({ where: { id: registrationId }, data: { status: 'ACCEPTED' } });
    return res.json(updated);
  }

  const assignment = await prisma.classAssignment.create({
    data: { classId: req.params.id, registrationId },
  });
  await prisma.registration.update({ where: { id: registrationId }, data: { status: 'ACCEPTED' } });
  res.status(201).json(assignment);
});

// Remove student from class
router.delete('/:id/assign/:registrationId', authenticate, requireAdmin, async (req, res) => {
  await prisma.classAssignment.delete({ where: { registrationId: req.params.registrationId } });
  res.json({ message: 'Santri dikeluarkan dari kelas' });
});

module.exports = router;

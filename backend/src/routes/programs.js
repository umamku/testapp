const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all active programs (public)
router.get('/', async (req, res) => {
  const programs = await prisma.program.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json(programs);
});

// Get all programs (admin)
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  const programs = await prisma.program.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { registrations: true, classes: true } } },
  });
  res.json(programs);
});

// Get single program
router.get('/:id', async (req, res) => {
  const program = await prisma.program.findUnique({ where: { id: req.params.id } });
  if (!program) return res.status(404).json({ message: 'Program tidak ditemukan' });
  res.json(program);
});

// Create program (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, description, schedule, fee, capacity } = req.body;
  if (!name || !description || !schedule || !fee || !capacity) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }
  const program = await prisma.program.create({
    data: { name, description, schedule, fee: parseInt(fee), capacity: parseInt(capacity) },
  });
  res.status(201).json(program);
});

// Update program (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, description, schedule, fee, capacity, isActive } = req.body;
  const program = await prisma.program.update({
    where: { id: req.params.id },
    data: {
      name,
      description,
      schedule,
      fee: parseInt(fee),
      capacity: parseInt(capacity),
      isActive: Boolean(isActive),
    },
  });
  res.json(program);
});

// Delete program (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.program.delete({ where: { id: req.params.id } });
  res.json({ message: 'Program dihapus' });
});

module.exports = router;

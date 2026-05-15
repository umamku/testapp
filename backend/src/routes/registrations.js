const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Create registration
router.post(
  '/',
  authenticate,
  upload.fields([
    { name: 'document', maxCount: 1 },
    { name: 'paymentProof', maxCount: 1 },
  ]),
  async (req, res) => {
    const {
      programId,
      santriName,
      santriDOB,
      santriGender,
      santriAddress,
      education,
      parentName,
      parentPhone,
      readingLevel,
    } = req.body;

    if (!programId || !santriName || !santriDOB || !santriGender || !santriAddress || !education || !parentName || !parentPhone || !readingLevel) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const documentUrl = req.files?.document?.[0]
      ? `/uploads/${req.files.document[0].filename}`
      : null;
    const paymentProofUrl = req.files?.paymentProof?.[0]
      ? `/uploads/${req.files.paymentProof[0].filename}`
      : null;

    const registration = await prisma.registration.create({
      data: {
        userId: req.user.id,
        programId,
        santriName,
        santriDOB,
        santriGender,
        santriAddress,
        education,
        parentName,
        parentPhone,
        readingLevel,
        documentUrl,
        paymentProofUrl,
      },
      include: { program: true },
    });

    res.status(201).json(registration);
  }
);

// Get my registrations
router.get('/my', authenticate, async (req, res) => {
  const registrations = await prisma.registration.findMany({
    where: { userId: req.user.id },
    include: {
      program: true,
      placementTest: true,
      classAssignment: { include: { class: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(registrations);
});

// Get single registration
router.get('/:id', authenticate, async (req, res) => {
  const registration = await prisma.registration.findUnique({
    where: { id: req.params.id },
    include: {
      program: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      placementTest: true,
      classAssignment: { include: { class: true } },
    },
  });
  if (!registration) return res.status(404).json({ message: 'Pendaftaran tidak ditemukan' });
  if (registration.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Akses ditolak' });
  }
  res.json(registration);
});

// Upload payment proof
router.post('/:id/payment', authenticate, upload.single('paymentProof'), async (req, res) => {
  const registration = await prisma.registration.findUnique({ where: { id: req.params.id } });
  if (!registration) return res.status(404).json({ message: 'Pendaftaran tidak ditemukan' });
  if (registration.userId !== req.user.id) return res.status(403).json({ message: 'Akses ditolak' });
  if (!req.file) return res.status(400).json({ message: 'File bukti bayar wajib diunggah' });

  const updated = await prisma.registration.update({
    where: { id: req.params.id },
    data: { paymentProofUrl: `/uploads/${req.file.filename}` },
  });
  res.json(updated);
});

module.exports = router;

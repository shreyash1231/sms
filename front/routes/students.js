const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Get all students with search, filter, pagination
router.get('/', async (req, res) => {
  try {
    const { q, course, year, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const where = {
      isActive: true,
      ...(q ? { OR: [{ fullName: { contains: q } }, { email: { contains: q } }] } : {}),
      ...(course ? { course } : {}),
      ...(year ? { graduationYear: parseInt(year) } : {}),
    };
    const students = await prisma.student.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { score: 'desc' },
    });
    // Ranking logic
    const sorted = await prisma.student.findMany({
      where: { isActive: true },
      orderBy: { score: 'desc' },
    });
    let rank = 1, prevScore = null, skipRank = 0;
    const rankMap = {};
    sorted.forEach((s, i) => {
      if (s.score === prevScore) {
        skipRank++;
      } else {
        rank += skipRank;
        skipRank = 0;
      }
      rankMap[s.id] = rank;
      prevScore = s.score;
    });
    const withRank = students.map(s => ({ ...s, rank: rankMap[s.id] }));
    const total = await prisma.student.count({ where });
    res.json({ students: withRank, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create student
router.post('/', async (req, res) => {
  try {
    const { fullName, email, course, graduationYear, score } = req.body;
    const student = await prisma.student.create({
      data: {
        fullName, email, course, graduationYear: parseInt(graduationYear), score: parseInt(score),
        ownerId: req.user.id
      }
    });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'ADMIN' && existing.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const student = await prisma.student.update({
      where: { id },
      data: req.body
    });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Soft delete student
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'ADMIN' && existing.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const student = await prisma.student.update({
      where: { id },
      data: { isActive: false }
    });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Prize = require('../models/prize');
const { body, validationResult } = require('express-validator');

// Validation rules for creating/updating prize
const prizeValidation = [
  body('name').notEmpty().withMessage('Name required'),
  body('cardClass').notEmpty().withMessage('cardClass required'),
  body('brand').notEmpty().withMessage('Brand required'),
  body('value').notEmpty().withMessage('Value required'),
  body('codePrefix').notEmpty().withMessage('Code prefix required')
];

// Get all prizes
router.get('/', async (req, res) => {
  try {
    const prizes = await Prize.find();
    res.json(prizes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get prize by id
router.get('/:id', async (req, res) => {
  try {
    const prize = await Prize.findById(req.params.id);
    if (!prize) return res.status(404).json({ error: 'Prize not found' });
    res.json(prize);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a prize
router.post('/', prizeValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const prize = new Prize(req.body);
    await prize.save();
    res.status(201).json(prize);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a prize
router.put('/:id', prizeValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const prize = await Prize.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!prize) return res.status(404).json({ error: 'Prize not found' });
    res.json(prize);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a prize
router.delete('/:id', async (req, res) => {
  try {
    const prize = await Prize.findByIdAndDelete(req.params.id);
    if (!prize) return res.status(404).json({ error: 'Prize not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

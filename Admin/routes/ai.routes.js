const express = require('express');
const router = express.Router();
const authController = require('../controller/auth.controller');
const ai = require('../../lib/openai-client');

// Demo endpoint: GET /admin/ai/ask?prompt=...
router.get('/ask', authController.isAuthenticated, async (req, res) => {
  const { prompt } = req.query;
  if (!prompt) return res.status(400).json({ message: 'prompt query required' });
  try {
    const r = await ai.ask(prompt);
    res.json(r);
  } catch (err) {
    console.error('AI error', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

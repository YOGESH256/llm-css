import express from 'express';
import  { extractReviews } from '../services/browserService.js';

const router = express.Router();

router.get('/reviews', async (req, res) => {
  const { page } = req.query;
  console.log(page)
  if (!page) {
    return res.status(400).json({ error: "Missing 'page' parameter" });
  }

  try {
    const reviews = await extractReviews(page);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
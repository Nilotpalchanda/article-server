const express = require('express');
const { homeScreendata } = require('./data/homeData.js');
const {
  handleArticlesRequest,
  asyncHandler,
  getAllArticles,
} = require('./utils');
const router = express.Router();

// Route: Get last used prompts (2 random articles)
router.get('/lastUsedPrompts', (req, res) => {
  const allArticles = getAllArticles(homeScreendata);

  const lastUsedPrompts = allArticles
    .slice(0, 2)
    .map(({ id, title }) => ({ id, title }));
  res.json({ lastUsedPrompts });
});

router.get(
  '/current-articles',
  handleArticlesRequest(homeScreendata.currentArticles)
);
router.get(
  '/popular-articles',
  handleArticlesRequest(homeScreendata.popularArticles)
);
// Route: Prompts library with pagination
router.get('/prompts-library', (req, res) => {
  const { limit, page } = req.query;
  const prompts = homeScreendata.promptLibrary || [];
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 0;

  if (limitNum > 0) {
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const paginatedPrompts = prompts.slice(start, end);
    return res.json({
      prompts: paginatedPrompts,
      total: prompts.length,
      page: pageNum,
      hasMore: end < prompts.length,
    });
  }
  res.json({ prompts, total: prompts.length });
});
// Route: AI Chat Response
router.get(
  '/chat',
  asyncHandler(async (req, res) => {
    const query = req.query.q?.trim().toLowerCase();
    if (!query) {
      return res.status(400).json({ error: 'Query param "q" is required' });
    }

    const allArticles = getAllArticles(homeScreendata);

    // Find the most accurate match by title or description
    const match =
      allArticles.find((a) => a.title.toLowerCase().includes(query)) ||
      allArticles.find((a) => a.description.toLowerCase().includes(query));

    // Find similar articles (excluding the main match)
    const similarArticles = allArticles
      .filter((a) => match && a.id !== match.id)
      .slice(0, 3)
      .map(({ id, title }) => ({ id, title }));

    res.json({
      aiResponse: match?.longDescription || 'No relevant information found.',
      suggestions: similarArticles.map((a) => a.title),
      source: match
        ? {
            id: match.id,
            title: match.title,
            description: match.description,
            category: match.category,
          }
        : { id: '', title: '', description: '', category: '' },
    });
  })
);

module.exports = router;

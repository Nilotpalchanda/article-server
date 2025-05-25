const express = require('express');
const cors = require('cors');
const { homeScreendata } = require('./data/homeData.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Utility: Combine all articles
const getAllArticles = () => [
  ...homeScreendata.currentArticles,
  ...homeScreendata.popularArticles,
];

// Utility: Generate MongoDB-like ObjectId
const generateObjectId = () =>
  Math.floor(Date.now() / 1000).toString(16) +
  'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () =>
    ((Math.random() * 16) | 0).toString(16)
  );

// Utility: Async handler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// GET: Home preview data
app.get(
  '/api/home',
  asyncHandler(async (req, res) => {
    const allCategories = getAllArticles()
      .map((article) => article.category)
      .filter(Boolean)
      .reduce((acc, cat) => {
        if (!acc.some((obj) => obj.title === cat)) {
          acc.push({ id: generateObjectId(), title: cat });
        }
        return acc;
      }, []);

    res.json({
      topics: allCategories,
      currentArticles: homeScreendata.currentArticles.slice(0, 4),
      popularArticles: homeScreendata.popularArticles.slice(0, 4),
    });
  })
);

// GET: All current articles
app.get(
  '/api/current-articles',
  asyncHandler(async (req, res) => {
    res.json(homeScreendata.currentArticles);
  })
);

// GET: All popular articles
app.get(
  '/api/popular-articles',
  asyncHandler(async (req, res) => {
    res.json(homeScreendata.popularArticles);
  })
);

// GET: Search suggestions
app.get(
  '/api/search-suggestions',
  asyncHandler(async (req, res) => {
    const query = req.query.q?.trim().toLowerCase();
    if (!query) {
      return res.status(400).json({ error: 'Query param "q" is required' });
    }
    const suggestions = getAllArticles()
      .filter(({ title }) => title.toLowerCase().includes(query))
      .map(({ id, title }) => ({ id, title }));
    res.json(suggestions);
  })
);

// GET: Search results with pagination
app.get(
  '/api/search-results',
  asyncHandler(async (req, res) => {
    const query = req.query.q?.trim().toLowerCase();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    if (!query) {
      return res.json({
        page,
        totalPages: 0,
        totalResults: 0,
        results: [],
      });
    }

    const filtered = getAllArticles().filter(
      ({ title, description }) =>
        title.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query)
    );

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const results = filtered.slice(start, start + limit);

    res.json({
      page,
      totalPages,
      totalResults: total,
      results,
    });
  })
);

// GET: Single article by ID
app.get(
  '/api/article/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const article = getAllArticles().find((a) => String(a.id) === String(id));
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  })
);

// GET: Home Screen
app.get(
  '/api/home-screen',
  asyncHandler(async (req, res) => {
    const combinedArticles = getAllArticles();
    const lastUsedPrompts = combinedArticles.slice(0, 2).map((article) => article.title);

    res.json({
      currentArticles: homeScreendata.currentArticles.slice(0, 3),
      popularArticles: homeScreendata.popularArticles.slice(0, 3),
      promptLibrary: homeScreendata.promptLibrary.slice(0, 3),
      lastUsedPrompts,
    });
  })
);

// GET: All Prompts
app.get(
  '/api/all-prompts',
  asyncHandler(async (req, res) => {
    res.json(homeScreendata.promptLibrary);
  })
);

// GET: AI Chat Response
app.get(
  '/api/chat',
  asyncHandler(async (req, res) => {
    const query = req.query.q?.trim().toLowerCase();
    if (!query) {
      return res.status(400).json({ error: 'Query param "q" is required' });
    }

    const allArticles = getAllArticles();

    // Find the most accurate match by title or description
    let match =
      allArticles.find((a) => a.title.toLowerCase() === query) ||
      allArticles.find((a) => a.title.toLowerCase().includes(query)) ||
      allArticles.find((a) => a.description.toLowerCase() === query) ||
      allArticles.find((a) => a.description.toLowerCase().includes(query));

    // Find similar articles (excluding the main match)
    const similarArticles = allArticles
      .filter((a) => match && a.id !== match.id)
      .slice(0, 3)
      .map((a) => ({ id: a.id, title: a.title }));

    res.json({
      aiResponse: match?.description || 'No relevant information found.',
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

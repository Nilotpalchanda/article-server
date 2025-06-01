const express = require('express');
const cors = require('cors');
const { homeScreendata } = require('./data/homeData.js');
const articleAtlasRoute = require('./articleatlas-server.js'); // Import the ArticleAtlas API routes
const {
  optimizeArticles,
  getAllArticles,
  asyncHandler,
  generateObjectId,
} = require('./utils.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// GET: Home preview data
app.get(
  '/api/home',
  asyncHandler(async (req, res) => {
    const allCategories = getAllArticles(homeScreendata)
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

// GET: Home Screen
app.get(
  '/api/home-screen',
  asyncHandler(async (req, res) => {
    const combinedArticles = getAllArticles(homeScreendata);
    const lastUsedPrompts = combinedArticles
      .slice(0, 2)
      .map((article) => article.title);

    res.json({
      currentArticles: optimizeArticles(
        homeScreendata.currentArticles.slice(0, 3),
        355,
        192
      ),
      popularArticles: optimizeArticles(
        homeScreendata.popularArticles.slice(0, 3),
        355,
        192
      ),
      promptLibrary: homeScreendata.promptLibrary.slice(0, 3),
      lastUsedPrompts,
    });
  })
);

// GET: All current articles
app.get(
  '/api/current-articles',
  asyncHandler(async (req, res) => {
    res.json(optimizeArticles(homeScreendata.currentArticles));
  })
);

// GET: All popular articles
app.get(
  '/api/popular-articles',
  asyncHandler(async (req, res) => {
    res.json(optimizeArticles(homeScreendata.popularArticles));
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
    const suggestions = getAllArticles(homeScreendata)
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

    const filtered = getAllArticles(homeScreendata).filter(
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
    const article = getAllArticles(homeScreendata).find(
      (a) => String(a.id) === String(id)
    );
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
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

    const allArticles = getAllArticles(homeScreendata);

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

// ArticleAtlas APIS
app.use('/atlas-api', articleAtlasRoute); // Now '/api/home2' will be handled by homeRoutes.js

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running at http://localhost:${PORT}`);
});

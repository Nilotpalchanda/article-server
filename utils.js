// Optimize images in all articles and promptLibrary to use .webp format
const optimizeImageUrl = (url, w = 268, h = 128) =>
  `${url}?auto=compress&fit=crop&w=${w}&h=${h}&format=webp`;

// Helper to deeply clone and optimize image fields in articles/prompts
const optimizeArticles = (articles, w, h) =>
  articles.map((article) => ({
    ...article,
    image: optimizeImageUrl(article.image, w, h),
  }));

// Utility function to generate an ObjectId-like string
const generateObjectId = () =>
  Math.floor(Date.now() / 1000).toString(16) +
  'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () =>
    ((Math.random() * 16) | 0).toString(16)
  );

// Helper to get articles with new IDs and optional limit
const getArticlesWithId = (articles, limit) => {
  const articlesWithId = articles.map((article) => ({
    ...article,
    articleId: generateObjectId(),
  }));
  return limit && Number.isInteger(limit) && limit > 0
    ? articlesWithId.slice(0, limit)
    : articlesWithId;
};

// Utility: Async handler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Utility: Combine all articles
const getAllArticles = (homeScreendata) => [
  ...homeScreendata.currentArticles,
  ...homeScreendata.popularArticles,
];

// Route: Get articles (current or popular)
const handleArticlesRequest = (sourceArticles) => (req, res) => {
  const limit = parseInt(req.query.limit, 10);
  const articles = getArticlesWithId(sourceArticles, limit);
  if (limit && Number.isInteger(limit) && limit > 0) {
    return res.json({
      articles: optimizeArticles(articles, 357, 192),
      total: articles.length,
    });
  }
  res.json({
    articles: optimizeArticles(articles, 357, 192),
    total: articles.length,
  });
};

module.exports = {
  optimizeArticles,
  generateObjectId,
  getArticlesWithId,
  asyncHandler,
  getAllArticles,
  optimizeImageUrl,
  handleArticlesRequest,
};

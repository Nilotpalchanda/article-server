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
const handleArticlesRequest = (sourceArticles, filterValue) => (req, res) => {
  const { limit = 0, page = 1 } = req.query;
  const limitNum = parseInt(limit, 10) || 0;
  const pageNum = parseInt(page, 10) || 1;

  let articles = getArticlesWithId(sourceArticles);

  if (filterValue && filterValue.trim() !== '' && filterValue !== 'All') {
    const filter = filterValue.toLowerCase();
    articles = articles.filter(
      (article) =>
        article.category && article.category.toLowerCase().includes(filter)
    );
  }

  const total = articles.length;
  let paginatedArticles = articles;
  let hasMore = false;

  if (limitNum > 0) {
    const start = (pageNum - 1) * limitNum;
    paginatedArticles = articles.slice(start, start + limitNum);
    hasMore = start + limitNum < total;
  }

  res.json({
    articles: optimizeArticles(paginatedArticles, 357, 192),
    total,
    page: pageNum,
    limit: limitNum,
    hasMore,
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

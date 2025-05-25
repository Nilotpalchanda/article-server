# Node.js Server for ArticleHub Platform

Welcome to the **Node.js Server** powering the Blog Platform! This server provides a robust, scalable, and secure backend for managing article posts and AI converstation.

---

## 🚀 Features

- **RESTful API** for blog operations (CRUD)
- **Input validation** and error handling
- **CORS** support for frontend integration
- **Environment-based configuration**

---

## 📦 Installation

```bash
git clone https://github.com/your-username/article-server.git
cd article-server
npm install
```

---

## ▶️ Running the Server

```bash
npm run dev
```

Server runs on [http://localhost:3001](http://localhost:3001)

---

## 📚 API Endpoints

| Method | Endpoint                  | Description                                      |
|--------|---------------------------|--------------------------------------------------|
| GET    | `/api/home-screen`        | Get home screen data (articles, prompts, etc.)   |
| GET    | `/api/current-articles`   | List all current articles                        |
| GET    | `/api/popular-articles`   | List all popular articles                        |
| GET    | `/api/search-suggestions` | Get article title suggestions (query param `q`)  |
| GET    | `/api/search-results`     | Search articles with pagination (`q`, `page`, `limit`) |
| GET    | `/api/article/:id`        | Get a single article by ID                       |
| GET    | `/api/all-prompts`        | List all prompts                                 |
| GET    | `/api/chat`               | Get AI chat response (query param `q`)           |

---

## 🧑‍💻 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

**Happy Coding!**

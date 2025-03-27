# 🧩 To-Do List App

A simple, modern To-Do List web application with full CRUD features.  
Built with React (frontend) + Express (backend), perfect for learning or bootstrapping your own productivity tool.

---

## 🚀 Features

- ✅ Add, delete, toggle to-do items
- 🎨 Responsive and modern UI
- ☑️ Checkbox to toggle completion
- 🧹 Completed items shown with strikethrough
- 🔄 Real-time updates (no page refresh)
- 🗂️ Clean file structure for frontend and backend
- 📦 Simple REST API to manage todos

---

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express
- **Styles**: Custom CSS
- **API**: RESTful Endpoints (in-memory storage)

---

## 📂 Folder Structure

```yaml
Extension-test-web/
├── client/                    # React frontend
│   ├── src/
│   │   └── App.tsx            # Main component
│   └── public/
│       └── index.html         # HTML entry point
├── server/                    # Express backend
│   ├── api/
│   │   └── todos.ts           # API routes for todos
│   └── index.ts               # Entry point for backend server
├── package.json               # Project dependencies and scripts
└── README.md                  # Project documentation

```

---

## 🔧 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/todo-app.git
cd todo-app
``` 

### 2. Start the backend

```bash
cd server
npm install
npm run dev
# Server running at http://localhost:3001/api/todos
```

### 3. Start the frontend

```bash
cd client
npm install
npm start
# App running at http://localhost:3000
```
Make sure the backend is running before you interact with the frontend UI!

## 📡 API Reference

| Method | Endpoint            | Description               |
|--------|---------------------|---------------------------|
| GET    | `/api/todos`        | Get all todos             |
| POST   | `/api/todos`        | Create a new todo         |
| PUT    | `/api/todos/:id`    | Toggle completed status   |
| DELETE | `/api/todos/:id`    | Delete a specific todo    |

### 📥 Example POST Body

```json
{
  "title": "Buy groceries"
}
```


---

### 🧪 Future Improvements

- 🌙 Dark mode toggle
- ✅ Filter: All / Active / Completed
- 💾 Persistent storage (localStorage or database)
- ✨ Better animations and UI polish
- 🚀 Deploy to Vercel or GitHub Pages

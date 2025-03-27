import express from 'express';
import cors from 'cors';
import todoRoutes from './api/todo';

const app = express();
app.use(cors());
app.use(express.json());

// Mount API
app.use('/api/todos', todoRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

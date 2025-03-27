import express from 'express';

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

const router = express.Router();

let todos: Todo[] = [];
let idCounter = 1;

// 1. Get all TODO items
router.get('/', (req, res) => {
  res.json(todos);
});

// 2. Create a new TODO item
router.post('/', (req, res) => {
  const { title } = req.body;
  const newTodo: Todo = { id: idCounter++, title, completed: false };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// 3. Delete a TODO item by ID
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  todos = todos.filter(todo => todo.id !== id);
  res.status(204).send();
});

// 4. Update the completed status of a TODO item
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { completed } = req.body;
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = completed;
    res.json(todo);
  } else {
    res.status(404).json({ error: 'Todo not found' });
  }
});

export default router;

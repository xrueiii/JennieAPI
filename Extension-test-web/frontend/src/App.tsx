import { useEffect, useState } from 'react';
import './App.css';

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await fetch('http://localhost:3001/api/todos');
    const data = await res.json();
    setTodos(data);
  };

  /* Test: Add a create Todo API function. Ex: const creatTodo = , 
   then try JennieAPI with right click.

  */

  const deleteTodo = async (id: number) => {
    await fetch(`http://localhost:3001/api/todos/${id}`, {
      method: 'DELETE',
    });
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleComplete = async (id: number, completed: boolean) => {
    const res = await fetch(`http://localhost:3001/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    });
    const updated = await res.json();
    setTodos(todos.map(t => (t.id === id ? updated : t)));
  };

  return (
    <div className="app-container">
      <h1 className="title">📝 My to do list</h1>
      <div className="input-area">
        <input
          className="input-box"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Please enter a new task"
        />
        {/* 
        If the button component didn't show up after API function generate, please add this line here.
        {<button className='add-button' onClick={() => addTodo(newTitle)}>Add New Task</button>}
        */}
      </div>
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleComplete(todo.id, todo.completed)}
              />
              <span className="todo-title">{todo.title}</span>
            </label>
            <button className="delete-button" onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;


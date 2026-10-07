import TodoItem from './TodoItem'

function TodoList({ todos, onToggle, onEdit, onDelete }) {
  if (todos.length === 0) {
    return (
      <div className="glass-panel empty-state">
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔮</div>
        <h3>No todos found</h3>
        <p>Your list is clear. Add a new task above and click <b>Save Todo</b> to get started!</p>
      </div>
    )
  }

  return (
    <div className="todo-list-grid">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default TodoList

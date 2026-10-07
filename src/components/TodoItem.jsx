function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const formattedDate = todo.createdAt 
    ? new Date(todo.createdAt).toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      }) 
    : 'Just now'

  return (
    <article className={`glass-panel todo-card-glass ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-card-main">
        <button
          type="button"
          onClick={() => onToggle(todo.id)}
          className={`droop-checkbox ${todo.completed ? 'checked' : ''}`}
          title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
          aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {todo.completed && (
            <svg viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        <div className="todo-details">
          <div className="todo-title-row">
            <h3>{todo.title}</h3>
            <span className={`badge-status ${todo.completed ? 'done' : 'pending'}`}>
              {todo.completed ? '✓ Completed' : '⏳ In Progress'}
            </span>
          </div>

          {todo.description && <p>{todo.description}</p>}

          <div className="todo-meta">
            <span>📅 {formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="card-actions-row">
        <button
          type="button"
          onClick={() => onEdit(todo)}
          className="icon-btn edit"
          title="Edit todo"
          aria-label="Edit todo"
        >
          ✏️
        </button>
        <button
          type="button"
          onClick={() => onDelete(todo.id)}
          className="icon-btn delete"
          title="Delete todo"
          aria-label="Delete todo"
        >
          🗑️
        </button>
      </div>
    </article>
  )
}

export default TodoItem

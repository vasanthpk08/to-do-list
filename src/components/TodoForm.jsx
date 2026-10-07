import { useEffect, useState } from 'react'

function TodoForm({ onSubmit, editingTodo, onCancelEdit }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title)
      setDescription(editingTodo.description || '')
      setError('')
    } else {
      setTitle('')
      setDescription('')
      setError('')
    }
  }, [editingTodo])

  const handleSubmit = async (event) => {
    if (event) event.preventDefault()

    const cleanTitle = title.trim()
    const cleanDescription = description.trim()

    if (!cleanTitle) {
      setError('Please enter a task title to save.')
      return
    }

    if (cleanTitle.length > 100) {
      setError('Title must be 100 characters or less.')
      return
    }

    if (cleanDescription.length > 500) {
      setError('Description must be 500 characters or less.')
      return
    }

    setError('')
    setIsSaving(true)

    try {
      await onSubmit({
        title: cleanTitle,
        description: cleanDescription,
        ...(editingTodo ? { completed: editingTodo.completed } : {}),
      })

      if (!editingTodo) {
        setTitle('')
        setDescription('')
      }
    } catch {
      // Handled by parent
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e) => {
    // Quick shortcut: Ctrl+Enter or Cmd+Enter to save immediately
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <form className="glass-panel todo-form-glass" onSubmit={handleSubmit}>
      <div className="form-title-badge">
        <span>{editingTodo ? '✏️ Edit Task' : '✨ Add New Todo'}</span>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter todo title..."
        maxLength={100}
        autoFocus={!!editingTodo}
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Description or notes (optional)..."
        rows="2"
        maxLength={500}
      />

      {error && <p className="form-error">⚠️ {error}</p>}

      <div className="form-footer">
        <span className="form-hint">Tip: Press <b>Ctrl + Enter</b> to save quickly</span>
        <div className="form-actions-row">
          {editingTodo && (
            <button type="button" className="cancel-glass-btn" onClick={onCancelEdit}>
              ✕ Cancel
            </button>
          )}

          <button 
            type="submit" 
            className="save-btn" 
            disabled={isSaving}
            id="save-todo-btn"
          >
            <span role="img" aria-label="save">💾</span>
            {isSaving ? 'Saving...' : editingTodo ? 'Save Changes' : 'Save Todo'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default TodoForm

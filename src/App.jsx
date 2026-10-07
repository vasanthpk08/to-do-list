import { useEffect, useState, useMemo } from 'react'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'
import {
  createTodo,
  deleteTodo,
  getTodos,
  toggleTodo,
  updateTodo,
} from './services/todoService'

const LOCAL_STORAGE_KEY = 'droopy_todos_cache_v1'

function App() {
  const [todos, setTodos] = useState([])
  const [editingTodo, setEditingTodo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isBackendOnline, setIsBackendOnline] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' | 'active' | 'completed'
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  // Show temporary toast
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 3000)
  }

  // Save to local backup
  const persistLocalBackup = (newList) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newList))
    } catch {
      // Ignore storage errors
    }
  }

  // Load initial todos
  const loadTodos = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getTodos()
      setTodos(response.data)
      setIsBackendOnline(true)
      persistLocalBackup(response.data)
    } catch {
      setIsBackendOnline(false)
      // Fallback to local storage
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          setTodos(parsed)
          setError('Spring Boot backend is offline. Changes are safely saved locally!')
        } catch {
          setTodos([])
        }
      } else {
        setError('Spring Boot server is offline. Running in Local Storage mode!')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTodos()
  }, [])

  // Create Todo
  const handleCreate = async (todoData) => {
    if (isBackendOnline) {
      try {
        setError('')
        const response = await createTodo(todoData)
        const updated = [response.data, ...todos]
        setTodos(updated)
        persistLocalBackup(updated)
        triggerToast('💾 Todo saved to database successfully!')
      } catch {
        // Fallback to local create
        handleOfflineCreate(todoData)
      }
    } else {
      handleOfflineCreate(todoData)
    }
  }

  const handleOfflineCreate = (todoData) => {
    const newTodo = {
      id: 'local_' + Date.now(),
      title: todoData.title,
      description: todoData.description,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    const updated = [newTodo, ...todos]
    setTodos(updated)
    persistLocalBackup(updated)
    triggerToast('💾 Todo saved locally!')
  }

  // Update Todo
  const handleUpdate = async (todoData) => {
    if (isBackendOnline && !String(todoData.id).startsWith('local_')) {
      try {
        setError('')
        const response = await updateTodo(todoData.id, todoData)
        const updated = todos.map((item) => (item.id === todoData.id ? response.data : item))
        setTodos(updated)
        persistLocalBackup(updated)
        setEditingTodo(null)
        triggerToast('💾 Changes saved successfully!')
      } catch {
        handleOfflineUpdate(todoData)
      }
    } else {
      handleOfflineUpdate(todoData)
    }
  }

  const handleOfflineUpdate = (todoData) => {
    const updated = todos.map((item) => (item.id === todoData.id ? { ...item, ...todoData } : item))
    setTodos(updated)
    persistLocalBackup(updated)
    setEditingTodo(null)
    triggerToast('💾 Changes saved locally!')
  }

  // Toggle Todo Status
  const handleToggle = async (id) => {
    if (isBackendOnline && !String(id).startsWith('local_')) {
      try {
        setError('')
        const response = await toggleTodo(id)
        const updated = todos.map((item) => (item.id === id ? response.data : item))
        setTodos(updated)
        persistLocalBackup(updated)
      } catch {
        handleOfflineToggle(id)
      }
    } else {
      handleOfflineToggle(id)
    }
  }

  const handleOfflineToggle = (id) => {
    const updated = todos.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    )
    setTodos(updated)
    persistLocalBackup(updated)
  }

  // Delete Todo
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return
    }

    if (isBackendOnline && !String(id).startsWith('local_')) {
      try {
        setError('')
        await deleteTodo(id)
        const updated = todos.filter((item) => item.id !== id)
        setTodos(updated)
        persistLocalBackup(updated)
        if (editingTodo?.id === id) setEditingTodo(null)
        triggerToast('🗑️ Todo removed')
      } catch {
        handleOfflineDelete(id)
      }
    } else {
      handleOfflineDelete(id)
    }
  }

  const handleOfflineDelete = (id) => {
    const updated = todos.filter((item) => item.id !== id)
    setTodos(updated)
    persistLocalBackup(updated)
    if (editingTodo?.id === id) setEditingTodo(null)
    triggerToast('🗑️ Todo removed')
  }

  const handleSubmit = async (todoData) => {
    if (editingTodo) {
      await handleUpdate({ ...todoData, id: editingTodo.id })
    } else {
      await handleCreate(todoData)
    }
  }

  // Save / Export Entire List to JSON file
  const handleSaveAndExportList = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(todos, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `todo-list-backup-${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    triggerToast('💾 Todo list saved & exported to file!')
  }

  // Filtered & Searched todos
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
      
      if (!matchesSearch) return false

      if (filter === 'active') return !todo.completed
      if (filter === 'completed') return todo.completed
      return true
    })
  }, [todos, filter, searchQuery])

  // Progress stats
  const totalCount = todos.length
  const completedCount = todos.filter((t) => t.completed).length
  const activeCount = totalCount - completedCount
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <>
      {/* Background Animated Droopy Blobs */}
      <div className="droopy-canvas-background">
        <div className="droop-blob droop-blob-1"></div>
        <div className="droop-blob droop-blob-2"></div>
        <div className="droop-blob droop-blob-3"></div>
      </div>

      <main className="app">
        <section className="container">
          {/* Header Panel */}
          <header className="glass-panel header-glass">
            <div className="header-badges-row">
              <span className="droop-pill">✨ Droopy & Glassy UI</span>
              <span className={`server-status-pill ${isBackendOnline ? 'online' : 'offline'}`}>
                <span className="status-dot"></span>
                {isBackendOnline ? 'Spring Boot Online' : 'Local Storage Mode'}
              </span>
            </div>

            <h1>Task Flow</h1>
            <p className="subtitle">Liquid Glassmorphism • React + Spring Boot + MongoDB</p>
          </header>

          {/* Quick Stats Grid */}
          <div className="stats-glass-grid">
            <div className="glass-panel stat-card">
              <span className="stat-label">Total Tasks</span>
              <span className="stat-number">{totalCount}</span>
            </div>
            <div className="glass-panel stat-card">
              <span className="stat-label">In Progress</span>
              <span className="stat-number" style={{ color: '#fcd34d' }}>{activeCount}</span>
            </div>
            <div className="glass-panel stat-card">
              <span className="stat-label">Completed</span>
              <span className="stat-number" style={{ color: '#6ee7b7' }}>{completedCount}</span>
            </div>
          </div>

          {/* Liquid Progress Bar */}
          {totalCount > 0 && (
            <div className="glass-panel progress-card">
              <div className="progress-header">
                <span>Task Completion</span>
                <span>{completionPercentage}% ({completedCount}/{totalCount})</span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Todo Input / Edit Form with Save Button */}
          <TodoForm
            onSubmit={handleSubmit}
            editingTodo={editingTodo}
            onCancelEdit={() => setEditingTodo(null)}
          />

          {error && (
            <div className="error-banner">
              <span>ℹ️ {error}</span>
              {!isBackendOnline && (
                <button 
                  type="button" 
                  onClick={loadTodos} 
                  className="export-glass-btn"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  🔄 Retry Server
                </button>
              )}
            </div>
          )}

          {/* Secondary Controls Toolbar */}
          <div className="glass-panel toolbar-glass">
            <div className="search-glass-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-pills-row">
              <button
                type="button"
                className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({totalCount})
              </button>
              <button
                type="button"
                className={`filter-pill ${filter === 'active' ? 'active' : ''}`}
                onClick={() => setFilter('active')}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                className={`filter-pill ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Done ({completedCount})
              </button>
            </div>

            {/* Save Entire List Backup Button */}
            <button
              type="button"
              className="export-glass-btn"
              onClick={handleSaveAndExportList}
              title="Save & Export your todo list to file"
            >
              💾 Save / Export List
            </button>
          </div>

          {/* Main Todo List */}
          {loading ? (
            <div className="glass-panel loading" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
              <p>Loading tasks...</p>
            </div>
          ) : (
            <TodoList
              todos={filteredTodos}
              onToggle={handleToggle}
              onEdit={setEditingTodo}
              onDelete={handleDelete}
            />
          )}
        </section>
      </main>

      {/* Floating Save Toast Notification */}
      {toastMessage && (
        <div className="glass-toast">
          {toastMessage}
        </div>
      )}
    </>
  )
}

export default App

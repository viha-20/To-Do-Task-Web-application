import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = 'http://localhost:8080/api'

function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks`)
      setTasks(response.data)
    } catch (err) {
      setError('Failed to fetch tasks. Please make sure the backend is running.')
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    setLoading(true)
    setError('')
    try {
      await axios.post(`${API_BASE_URL}/tasks`, {
        title: formData.title,
        description: formData.description
      })
      
      setFormData({ title: '', description: '' })
      await fetchTasks() // Refreshing the task list 
    } catch (err) {
      setError('Failed to create task. Please try again.')
      console.error('Error creating task:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsDone = async (taskId) => {
    setLoading(true)
    setError('')
    try {
      await axios.put(`${API_BASE_URL}/tasks/${taskId}/complete`)
      await fetchTasks() // Refreshing the task list
    } catch (err) {
      setError('Failed to mark task as done. Please try again.')
      console.error('Error marking task as done:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container">
      <h1 className="app-title">Todo App</h1>
      
      <div className="todo-app">
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter task description (optional)"
              rows="3"
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading || !formData.title.trim()}
          >
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </form>

        <div className="tasks-section">
          <h2>Recent Tasks ({tasks.length}/5)</h2>
          
          {loading && tasks.length === 0 ? (
            <div className="loading">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              No tasks yet. Add your first task above!
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <h3 className="task-title">{task.title}</h3>
                  </div>
                  
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  
                  <div className="task-meta">
                    <span>Created: {formatDate(task.createdAt)}</span>
                    <button
                      onClick={() => handleMarkAsDone(task.id)}
                      className="done-btn"
                      disabled={loading}
                    >
                      {loading ? '...' : 'Done'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
'use client'

import React, { useState, useEffect } from 'react'
import { useKanbanStore, TaskStatus, Task } from '@/store/useKanbanStore'
import { Plus, GripVertical, AlertCircle, Loader2 } from 'lucide-react'
import { NewTaskModal } from '@/components/modals/NewTaskModal'

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: 'bg-gray-500/20 text-gray-300' },
  { id: 'todo', title: 'To Do', color: 'bg-blue-500/20 text-blue-300' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-500/20 text-yellow-300' },
  { id: 'blocked', title: 'Blocked', color: 'bg-red-500/20 text-red-300' },
  { id: 'done', title: 'Done', color: 'bg-emerald-500/20 text-emerald-300' },
]

const priorityColors = {
  low: 'bg-gray-500/20 text-gray-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
  urgent: 'bg-red-500/20 text-red-400',
}

export default function KanbanPage() {
  const { tasks, loading, updateTaskStatus, fetchTasks } = useKanbanStore()
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId)
    e.dataTransfer.effectAllowed = 'move'
    // Transparent image for native drag ghost (optional polish)
    const img = new Image()
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    e.dataTransfer.setDragImage(img, 0, 0)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Necessary to allow dropping
  }

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    if (draggedTask) {
      updateTaskStatus(draggedTask, status)
      setDraggedTask(null)
    }
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Kanban Board</h1>
          <p className="text-gray-400 mt-1">Görevlerinizi sürükleyip bırakarak yönetin.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Yeni Görev
        </button>
      </div>

      {loading && tasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <Loader2 size={24} className="animate-spin mr-2" />
          <span>Görevler yükleniyor...</span>
        </div>
      ) : (
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id)
          
          return (
            <div
              key={col.id}
              className="flex-shrink-0 w-80 flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`px-2.5 py-1 rounded-md text-xs font-medium ${col.color}`}>
                    {col.title}
                  </div>
                  <span className="text-gray-500 text-xs font-medium">{colTasks.length}</span>
                </div>
              </div>
              
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className={`p-4 rounded-xl border border-white/10 bg-[#121214] hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-grab active:cursor-grabbing shadow-sm group ${draggedTask === task.id ? 'opacity-50 border-blue-500/50' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-1 text-gray-600 group-hover:text-gray-400 cursor-grab">
                        <GripVertical size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-200 leading-snug">{task.title}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                          {task.status === 'blocked' && (
                            <AlertCircle size={14} className="text-red-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      )}

      <NewTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

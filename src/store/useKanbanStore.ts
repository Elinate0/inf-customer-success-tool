import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'blocked' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  position: number
  customer_id?: string
  created_at?: string
}

interface KanbanState {
  tasks: Task[]
  loading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  addTask: (task: Omit<Task, 'id' | 'position' | 'created_at'>) => Promise<void>
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>
}

const supabase = createClient()

export const useKanbanStore = create<KanbanState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  
  fetchTasks: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: false })
      
      if (error) throw error
      set({ tasks: data || [], loading: false })
    } catch (err: any) {
      set({ error: err.message, loading: false })
      console.error('Fetch tasks error:', err)
    }
  },

  addTask: async (newTask) => {
    set({ loading: true, error: null })
    try {
      const currentTasks = get().tasks
      const tasksInSameStatus = currentTasks.filter(t => t.status === newTask.status)
      const newPosition = tasksInSameStatus.length > 0 
        ? Math.max(...tasksInSameStatus.map(t => t.position)) + 1 
        : 0

      const taskToInsert = {
        ...newTask,
        position: newPosition
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskToInsert])
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        tasks: [...state.tasks, data],
        loading: false
      }))
    } catch (err: any) {
      set({ error: err.message, loading: false })
      console.error('Add task error:', err)
      throw err
    }
  },

  updateTaskStatus: async (taskId, newStatus) => {
    // Optimistic UI update
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    }))

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) {
        throw error
      }
    } catch (err: any) {
      console.error('Update task status error:', err)
      // Rollback could be implemented here if needed
      await get().fetchTasks()
    }
  }
}))

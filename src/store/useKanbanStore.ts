import { create } from 'zustand'

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
}

interface KanbanState {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void
  moveTask: (taskId: string, newStatus: TaskStatus, newIndex: number) => void
}

// Temporary Mock Data
const mockTasks: Task[] = [
  { id: '1', title: 'Onboarding Toplantısı (Acme Corp)', status: 'todo', priority: 'high', position: 0 },
  { id: '2', title: 'Q3 Değerlendirme Raporu Hazırla', status: 'in_progress', priority: 'medium', position: 0 },
  { id: '3', title: 'Fatura Entegrasyonu Sorunu', status: 'blocked', priority: 'urgent', position: 0 },
  { id: '4', title: 'Yeni Kullanıcı Eğitimi (XYZ Ltd)', status: 'done', priority: 'medium', position: 0 },
]

export const useKanbanStore = create<KanbanState>((set) => ({
  tasks: mockTasks,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTaskStatus: (taskId, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    })),
  moveTask: (taskId, newStatus, newIndex) => {
    set((state) => {
      // Basic local state update for drag and drop (simplified for now without exact position calculation)
      // Real implementation would calculate exact position numbers for Supabase order
      const newTasks = state.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      return { tasks: newTasks }
    })
  }
}))

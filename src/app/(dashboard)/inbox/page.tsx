'use client'

import { useState, useEffect } from 'react'
import { GraphEmail, graphMailService } from '@/lib/services/GraphMailService'
import { geminiAiService } from '@/lib/services/GeminiAiService'
import { useKanbanStore } from '@/store/useKanbanStore'
import { Sparkles, Reply, ListPlus, Loader2, Mail, MailOpen } from 'lucide-react'

export default function InboxPage() {
  const [emails, setEmails] = useState<GraphEmail[]>([])
  const [selectedEmail, setSelectedEmail] = useState<GraphEmail | null>(null)
  
  // AI States
  const [loadingAi, setLoadingAi] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [draft, setDraft] = useState<string | null>(null)
  const [extractedTasks, setExtractedTasks] = useState<{ title: string, priority: any }[]>([])

  const { addTask } = useKanbanStore()

  useEffect(() => {
    // Load mock emails on mount
    graphMailService.getRecentEmails().then(setEmails)
  }, [])

  const handleSelectEmail = (email: GraphEmail) => {
    setSelectedEmail(email)
    setSummary(null)
    setDraft(null)
    setExtractedTasks([])
  }

  const handleSummarize = async () => {
    if (!selectedEmail) return
    setLoadingAi(true)
    const result = await geminiAiService.summarizeEmail(selectedEmail.body.content)
    setSummary(result)
    setLoadingAi(false)
  }

  const handleExtractTasks = async () => {
    if (!selectedEmail) return
    setLoadingAi(true)
    const result = await geminiAiService.extractTasks(selectedEmail.body.content)
    setExtractedTasks(result)
    setLoadingAi(false)
  }

  const handleDraftReply = async () => {
    if (!selectedEmail) return
    setLoadingAi(true)
    const result = await geminiAiService.draftReply(selectedEmail.body.content)
    setDraft(result)
    setLoadingAi(false)
  }

  const handleCreateTaskFromAi = (taskTitle: string, priority: any) => {
    addTask({
      title: taskTitle,
      status: 'todo',
      priority
    })
    // Remove from extracted list
    setExtractedTasks(prev => prev.filter(t => t.title !== taskTitle))
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
          <Sparkles size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Destekli Gelen Kutusu</h1>
          <p className="text-gray-400 text-sm mt-1">E-postalarınızı Gemini ile özetleyin, görevlere dönüştürün.</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Email List (Left Sidebar) */}
        <div className="w-1/3 flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-black/20">
            <h2 className="text-sm font-medium text-gray-300">Gelen Kutusu (Son 20)</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => handleSelectEmail(email)}
                className={`w-full text-left p-4 border-b border-white/5 transition-all hover:bg-white/[0.03] ${
                  selectedEmail?.id === email.id ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium ${!email.isRead ? 'text-white' : 'text-gray-400'}`}>
                    {email.sender.emailAddress.name}
                  </span>
                  {!email.isRead && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                </div>
                <div className={`text-xs mb-1 truncate ${!email.isRead ? 'text-gray-200' : 'text-gray-500'}`}>
                  {email.subject}
                </div>
                <div className="text-xs text-gray-600 truncate">{email.bodyPreview}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Email Reading Pane & AI Copilot (Right) */}
        <div className="flex-1 flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative">
          {selectedEmail ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white mb-2">{selectedEmail.subject}</h2>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="text-gray-300">{selectedEmail.sender.emailAddress.name}</span>
                  <span>&lt;{selectedEmail.sender.emailAddress.address}&gt;</span>
                  <span className="ml-auto text-xs">
                    {new Date(selectedEmail.receivedDateTime).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 p-6 overflow-y-auto text-gray-300 text-sm leading-relaxed">
                {selectedEmail.body.content}
              </div>

              {/* AI Copilot Action Bar */}
              <div className="p-4 bg-black/40 border-t border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={12} />
                    Gemini Copilot
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSummarize}
                      disabled={loadingAi}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-gray-300 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      Özet Çıkar
                    </button>
                    <button 
                      onClick={handleExtractTasks}
                      disabled={loadingAi}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-gray-300 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <ListPlus size={14} />
                      Görev (Task) Çıkar
                    </button>
                    <button 
                      onClick={handleDraftReply}
                      disabled={loadingAi}
                      className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-xs font-medium text-blue-300 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Reply size={14} />
                      Akıllı Yanıt Taslağı
                    </button>
                  </div>
                  {loadingAi && <Loader2 size={14} className="text-purple-400 animate-spin ml-auto" />}
                </div>

                {/* AI Results Area */}
                {(summary || extractedTasks.length > 0 || draft) && (
                  <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-4">
                    {summary && (
                      <div>
                        <h4 className="text-xs font-medium text-purple-400 mb-1">Özet:</h4>
                        <p className="text-sm text-gray-300">{summary}</p>
                      </div>
                    )}
                    
                    {extractedTasks.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-purple-400 mb-2">Çıkarılan Görevler:</h4>
                        <div className="space-y-2">
                          {extractedTasks.map((task, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                              <span className="text-sm text-gray-300">{task.title}</span>
                              <button 
                                onClick={() => handleCreateTaskFromAi(task.title, task.priority)}
                                className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                              >
                                Kanban'a Ekle
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {draft && (
                      <div>
                        <h4 className="text-xs font-medium text-purple-400 mb-1">Taslak Yanıt:</h4>
                        <textarea 
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-gray-300 outline-none focus:border-purple-500/50"
                        />
                        <button className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors w-full">
                          Gönder
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                <MailOpen size={24} className="text-gray-600" />
              </div>
              <p>Okumak için bir e-posta seçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

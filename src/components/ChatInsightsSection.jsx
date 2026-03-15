import { useRef, useState } from 'react'
import { getRecordActorName } from '../services/api'
import { parseDocumentInChat, parseChatInput } from '../services/chat'
import { formatTaskDeadline } from '../services/tasks'

const starterPrompts = [
  'Paid 50k to backend developer',
  'Received 1.2L from consulting project',
  'Create task for onboarding vendors',
]

const ACCEPTED_FILE_TYPES = '.pdf,.docx,image/png,image/jpeg,image/webp,image/gif'

function normalizeRecord(record) {
  if (!record) return record
  return { ...record, id: record.id || (record._id ? String(record._id) : undefined) }
}

function formatActionValue(action, executedRecord) {
  if (action.type === 'expense') {
    const amount = action.amount || executedRecord?.amount || 'Unknown'
    const vendor = action.vendor || executedRecord?.vendor || 'Unknown'
    return [`Amount: ${amount}`, `Vendor: ${vendor}`]
  }
  if (action.type === 'income') {
    const amount = action.amount || executedRecord?.amount || 'Unknown'
    const source = action.source || executedRecord?.source || 'Unknown'
    const client = action.client || executedRecord?.client || 'Unknown'
    return [`Amount: ${amount}`, `Source: ${source}`, `Client: ${client}`]
  }
  if (action.type === 'task') {
    const priority = action.priority || executedRecord?.priority || 'Unknown'
    const deadline = action.deadline || executedRecord?.deadline
    return [`Title: ${action.title}`, `Priority: ${priority}`, ...(deadline ? [`Due: ${formatTaskDeadline(deadline)}`] : [])]
  }
  return []
}

function PaperclipIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M21 11.5L12.5 20a5 5 0 0 1-7.07-7.07l8.49-8.49a3 3 0 0 1 4.24 4.24L9.67 17.17a1 1 0 0 1-1.41-1.41L16.07 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  )
}

export default function ChatInsightsSection({ selectedProject, setExpenses, setIncomeEntries, setTasks }) {
  const canExecuteActions = selectedProject?.currentUserRole !== 'viewer'
  const [message, setMessage] = useState('')
  const [attachedFile, setAttachedFile] = useState(null)
  const [history, setHistory] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  function applyExecutedToState(executed) {
    if (!Array.isArray(executed)) return
    const newExpenses = executed.filter((r) => r.type === 'expense').map((r) => normalizeRecord(r.record))
    const newIncome = executed.filter((r) => r.type === 'income').map((r) => normalizeRecord(r.record))
    const newTasks = executed.filter((r) => r.type === 'task').map((r) => normalizeRecord(r.record))
    if (newExpenses.length && setExpenses) setExpenses((current) => [...newExpenses, ...current])
    if (newIncome.length && setIncomeEntries) setIncomeEntries((current) => [...newIncome, ...current])
    if (newTasks.length && setTasks) setTasks((current) => [...newTasks, ...current])
  }

  async function sendMessage(rawMessage) {
    const trimmedMessage = rawMessage.trim()
    if (!trimmedMessage) return

    setIsSubmitting(true)
    setError('')
    setHistory((current) => [...current, { id: crypto.randomUUID(), role: 'user', text: trimmedMessage }])

    try {
      const parsed = await parseChatInput({
        message: trimmedMessage,
        projectId: selectedProject?.id || null,
        execute: Boolean(selectedProject?.id && canExecuteActions),
      })
      applyExecutedToState(parsed.executed)
      setHistory((current) => [
        ...current,
        { id: crypto.randomUUID(), role: 'assistant', text: parsed.summary, actions: parsed.actions, executed: parsed.executed },
      ])
      setMessage('')
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function sendDocument(file) {
    setIsSubmitting(true)
    setError('')
    setHistory((current) => [
      ...current,
      { id: crypto.randomUUID(), role: 'user', text: `📄 ${file.name}`, isDocument: true },
    ])
    setAttachedFile(null)

    if (!selectedProject?.id) {
      setHistory((current) => [
        ...current,
        { id: crypto.randomUUID(), role: 'assistant', text: 'Select a project first to parse and save document transactions.' },
      ])
      setIsSubmitting(false)
      return
    }

    if (!canExecuteActions) {
      setHistory((current) => [
        ...current,
        { id: crypto.randomUUID(), role: 'assistant', text: 'This project is read-only for your account. Only owners and editors can save parsed document transactions.' },
      ])
      setIsSubmitting(false)
      return
    }

    try {
      const parsed = await parseDocumentInChat(file, selectedProject.id, selectedProject.firmName || '')
      applyExecutedToState(parsed.executed)
      setHistory((current) => [
        ...current,
        { id: crypto.randomUUID(), role: 'assistant', text: parsed.summary, actions: parsed.actions, executed: parsed.executed, isDocumentResult: true },
      ])
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (attachedFile) {
      sendDocument(attachedFile)
    } else {
      sendMessage(message)
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null
    setAttachedFile(file)
    event.target.value = ''
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-100 bg-white/90 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur-sm lg:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">AI Chat</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">Natural language action parser</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
          Type plain English finance or task updates, or attach an invoice / bank statement — the AI will extract expenses and income automatically and save them to the project.
        </p>
        {selectedProject ? (
          <p className="mt-3 text-sm text-slate-600">
            Project: <strong>{selectedProject.name}</strong> — {canExecuteActions ? 'actions will be saved to the database automatically.' : 'you can parse messages, but saving actions is disabled for viewer access.'}
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Select a project to enable automatic saving of parsed actions.</p>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <article className="rounded-[2rem] border border-slate-100 bg-white/90 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Example prompts</p>
          <div className="mt-5 space-y-3">
            {starterPrompts.map((prompt) => (
              <button
                className="w-full rounded-[1.4rem] border border-slate-100 bg-gradient-to-r from-[#f9fafb] to-white px-4 py-4 text-left text-sm text-slate-700 transition hover:border-slate-200 hover:shadow-sm"
                key={prompt}
                onClick={() => { setAttachedFile(null); setMessage(prompt) }}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Upload document</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Attach an invoice, bank statement, or receipt. The AI will detect all debits (expenses) and credits (income) and log them.
            </p>
            <button
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-[1.4rem] border border-dashed border-slate-300 bg-[#f9fafb] px-4 py-5 text-sm text-slate-600 transition hover:border-slate-500 hover:bg-white"
              disabled={!canExecuteActions}
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <PaperclipIcon />
              Attach PDF, DOCX, or image
            </button>
            <input
              accept={ACCEPTED_FILE_TYPES}
              className="sr-only"
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-100 bg-white/90 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Chat history</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">Parser conversation</h3>
            </div>
            <span className="rounded-full border border-slate-200 bg-[#fafafa] px-3 py-1 text-xs font-medium text-slate-700">
              {history.length} messages
            </span>
          </div>

          <div className="mt-6 h-[420px] space-y-4 overflow-y-auto rounded-[1.5rem] border border-slate-100 bg-[#f9fafb] p-4">
            {history.length ? (
              history.map((entry) => (
                <div className={entry.role === 'user' ? 'flex justify-end' : 'flex justify-start'} key={entry.id}>
                  <div
                    className={[
                      'max-w-[85%] rounded-[1.4rem] px-4 py-3',
                      entry.role === 'user' ? 'bg-slate-900 text-white shadow-[0_14px_30px_rgba(15,23,42,0.22)]' : 'border border-slate-100 bg-white text-slate-900 shadow-sm',
                    ].join(' ')}
                  >
                    <p className="text-sm leading-6">{entry.text}</p>
                    {entry.actions?.length ? (
                      <div className="mt-3 space-y-2">
                        {entry.isDocumentResult ? (
                          <p className="px-1 text-xs font-medium text-slate-500 uppercase tracking-wide">Extracted transactions</p>
                        ) : null}
                        {entry.actions.map((action, index) => {
                          const executedRecord = entry.executed?.[index]?.record
                          return (
                            <div className="rounded-[1rem] border border-slate-100 bg-[#f9fafb] px-3 py-3 text-sm text-slate-700" key={`${entry.id}-${action.type}-${index}`}>
                              <p className="font-medium capitalize text-slate-950">{action.type} action</p>
                              <div className="mt-2 space-y-1">
                                {formatActionValue(action, executedRecord).map((line) => (
                                  <p key={line}>{line}</p>
                                ))}
                              </div>
                              {getRecordActorName(executedRecord) ? (
                                <div className="mt-3">
                                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                    Saved by {getRecordActorName(executedRecord)}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          )
                        })}
                        {entry.executed?.length ? (
                          <p className="px-1 text-xs text-emerald-600">✓ Saved to project</p>
                        ) : selectedProject?.id && !canExecuteActions && entry.role === 'assistant' ? (
                          <p className="px-1 text-xs text-amber-600">Read-only mode: parsed only, not saved.</p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
                Send a message or attach a financial document to get started.
              </div>
            )}
          </div>

          {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

          {attachedFile ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-[#f9fafb] px-4 py-3">
              <PaperclipIcon />
              <span className="flex-1 truncate text-sm text-slate-700">{attachedFile.name}</span>
              <button
                className="text-xs text-slate-400 hover:text-slate-700"
                onClick={() => setAttachedFile(null)}
                type="button"
              >
                Remove
              </button>
            </div>
          ) : null}

          <form className="mt-4 flex gap-3" onSubmit={handleSubmit}>
            <button
              className="flex-shrink-0 rounded-2xl border border-slate-200 bg-[#fafafa] p-3.5 text-slate-600 transition hover:border-slate-400 hover:bg-white"
              disabled={!canExecuteActions}
              onClick={() => fileInputRef.current?.click()}
              title="Attach document"
              type="button"
            >
              <PaperclipIcon />
            </button>
            <input
              className="flex-1 rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200 disabled:opacity-50"
              disabled={Boolean(attachedFile)}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={attachedFile ? 'File attached — click Send to parse' : 'Type a natural language action…'}
              value={attachedFile ? '' : message}
            />
            <button
              className="rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting || (!message.trim() && !attachedFile)}
              type="submit"
            >
              {isSubmitting ? 'Processing…' : 'Send'}
            </button>
          </form>
        </article>
      </section>
    </div>
  )
}
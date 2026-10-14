import React, { useEffect, useRef, useState } from 'react'
import { Sparkles, Send, RefreshCw, Camera, AlertTriangle, Info, Bird } from 'lucide-react'
import { getBatches } from '../api/index'
import { getInsights, streamChat, analyzeImage }  from '../api/index'

const card = 'bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl'
const inp = 'bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-green-500 transition-colors placeholder:text-slate-600'
const label = 'text-[10px] text-slate-500 uppercase tracking-widest font-semibold'

const LEVEL = {
  danger: 'bg-red-500/10 border-red-500/30 text-red-400',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
}
const PRIORITY = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-amber-500/20 text-amber-400',
  low: 'bg-green-500/20 text-green-400',
}
const PROMPTS = [
  'How is my farm doing this month?',
  'Which feed should I reorder first?',
  'When should I harvest my active batch?',
  'Nipe muhtasari wa shamba langu',
]

// Shows **bold** text and "- bullet" lines from the AI's reply.
function RichText({ text }) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />
    const bullet = /^\s*[-*]\s+/.test(line)
    const parts = line.replace(/^\s*[-*]\s+/, '').split(/\*\*(.+?)\*\*/g)
    return (
      <p key={i} className={bullet ? 'relative pl-4' : ''}>
        {bullet && <span className="absolute left-0">•</span>}
        {parts.map((p, j) => (j % 2 ? <strong key={j}>{p}</strong> : p))}
      </p>
    )
  })
}

export default function ChakaFarmAi() {
  const [batches, setBatches] = useState([])
  const [batchId, setBatchId] = useState('')

  const [insights, setInsights] = useState(null)
  const [insLoading, setInsLoading] = useState(true)
  const [insError, setInsError] = useState('')

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef(null)

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [age, setAge] = useState('')
  const [analysing, setAnalysing] = useState(false)
  const [report, setReport] = useState(null)
  const [imgError, setImgError] = useState('')

  const loadInsights = () => {
    setInsLoading(true)
    setInsError('')
    getInsights().then(setInsights).catch(e => setInsError(e.message)).finally(() => setInsLoading(false))
  }

  useEffect(() => {
    getBatches().then(r => setBatches(r.data || [])).catch(() => {})
    loadInsights()
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    const message = (text ?? input).trim()
    if (!message || sending) return
    const history = messages.filter(m => !m.error).map(({ role, content }) => ({ role, content }))
    setMessages(m => [...m, { role: 'user', content: message }, { role: 'assistant', content: '' }])
    setInput('')
    setSending(true)
    const patchLast = (fn) => setMessages(m => m.map((x, i) => (i === m.length - 1 ? fn(x) : x)))
    try {
      await streamChat({ message, history, batchId }, chunk => patchLast(x => ({ ...x, content: x.content + chunk })))
    } catch (err) {
      patchLast(x => ({ ...x, content: err.message, error: true }))
    } finally {
      setSending(false)
    }
  }

  const onPick = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!['image/jpeg', 'image/png'].includes(f.type)) return setImgError('Use a JPG or PNG photo.')
    if (f.size > 5 * 1024 * 1024) return setImgError('This photo is over 5 MB. Resize it and try again.')
    setImgError('')
    setReport(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const analyse = async () => {
    setAnalysing(true)
    setImgError('')
    try {
      setReport(await analyzeImage(file, batchId, age))
    } catch (err) {
      setImgError(err.message)
    } finally {
      setAnalysing(false)
    }
  }

  return (
    <div className="max-w-[1100px] w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-green-500" /> ChakaFarm AI
          </h1>
          <p className="text-slate-500 text-sm mt-1">Ask questions about your farm, get insights, and check bird photos</p>
        </div>
        <div className="flex flex-col gap-1.5 w-full sm:w-56">
          <span className={label}>Focus on batch</span>
          <select className={inp} value={batchId} onChange={e => setBatchId(e.target.value)}>
            <option value="">Whole farm</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chat */}
        <div className={`${card} lg:col-span-2 flex flex-col h-[640px]`}>
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="m-auto text-center max-w-sm">
                <Bird className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="text-[var(--text-primary)] font-semibold">Ask about your farm</p>
                <p className="text-slate-500 text-sm mt-1 mb-4">Answers use your current batches, feed, costs and housing. You can write in English or Swahili.</p>
                <div className="flex flex-col gap-2">
                  {PROMPTS.map(p => (
                    <button key={p} onClick={() => send(p)} className="text-sm text-left px-4 py-2.5 rounded-xl border border-[var(--border)] text-slate-400 hover:text-[var(--text-primary)] hover:border-green-500/50 transition-colors cursor-pointer bg-transparent">{p}</button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed flex flex-col gap-1 ${
                    m.role === 'user' ? 'bg-green-500 text-black font-medium'
                    : m.error ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                    : 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]'}`}>
                    {m.content ? <RichText text={m.content} /> : <span className="text-slate-500 animate-pulse">Thinking...</span>}
                  </div>
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>
          <form onSubmit={e => { e.preventDefault(); send() }} className="flex gap-2 p-4 border-t border-[var(--border)]">
            <input className={`${inp} flex-1`} value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about feed, profit, harvest dates..." maxLength={2000} />
            <button type="submit" disabled={sending || !input.trim()} className="px-4 rounded-xl bg-green-500 text-black font-bold hover:bg-green-400 transition-colors cursor-pointer border-none disabled:opacity-50" aria-label="Send">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Side column */}
        <div className="flex flex-col gap-5">
          {/* Insights */}
          <div className={`${card} p-5`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-[var(--text-primary)]">Farm insights</h2>
              <button onClick={loadInsights} disabled={insLoading} className="p-1.5 rounded-lg border border-[var(--border)] text-slate-400 hover:text-green-400 transition-colors cursor-pointer bg-transparent disabled:opacity-50" aria-label="Refresh insights">
                <RefreshCw className={`w-3.5 h-3.5 ${insLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {insLoading && !insights ? (
              <p className="text-slate-500 text-sm animate-pulse">Analysing your farm... the first load can take a minute.</p>
            ) : insError ? (
              <p className="text-sm text-red-400">Could not load insights: {insError}</p>
            ) : insights && (
              <div className="flex flex-col gap-4">
                {insights.alerts.length === 0 && insights.recommendations.length === 0 && (
                  <p className="text-slate-500 text-sm">Nothing to flag yet. Add batches, feed and costs to get insights.</p>
                )}
                {insights.alerts.map((a, i) => (
                  <div key={i} className={`border rounded-xl p-3 ${LEVEL[a.level] ?? LEVEL.info}`}>
                    <div className="flex items-center gap-2 text-sm font-bold">
                      {a.level === 'info' ? <Info className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />} {a.title}
                    </div>
                    <p className="text-xs mt-1 opacity-90">{a.message}</p>
                  </div>
                ))}
                {insights.recommendations.length > 0 && (
                  <div>
                    <p className={`${label} mb-2`}>Recommended actions</p>
                    <div className="flex flex-col gap-2">
                      {insights.recommendations.map((r, i) => (
                        <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-3">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-sm font-semibold text-[var(--text-primary)]">{r.title}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${PRIORITY[r.priority] ?? PRIORITY.low}`}>{r.priority}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{r.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {insights.forecast && (
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className={label}>30-day forecast</span>
                      <span className="text-[10px] text-slate-500">{insights.forecast.confidence} confidence</span>
                    </div>
                    <p className="text-sm text-[var(--text-primary)]">{insights.forecast.next_30_days}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Photo check */}
          <div className={`${card} p-5`}>
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-1">Photo check</h2>
            <p className="text-xs text-slate-500 mb-4">Upload a clear JPG or PNG of your birds. This is guidance, not a diagnosis.</p>

            <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-[var(--border)] rounded-xl h-32 cursor-pointer hover:border-green-500/50 transition-colors overflow-hidden">
              <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={onPick} />
              {preview ? <img src={preview} alt="Selected bird photo" className="h-full w-full object-cover" /> : (
                <><Camera className="w-6 h-6 text-slate-500" /><span className="text-xs text-slate-500">Choose a photo</span></>
              )}
            </label>

            <div className="flex gap-2 mt-3">
              <input className={`${inp} w-28`} type="number" min="0" value={age} onChange={e => setAge(e.target.value)} placeholder="Age (days)" />
              <button onClick={analyse} disabled={!file || analysing} className="flex-1 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors cursor-pointer border-none disabled:opacity-50">
                {analysing ? 'Analysing...' : 'Analyse photo'}
              </button>
            </div>
            {imgError && <p className="text-sm text-red-400 mt-3">{imgError}</p>}

            {report && (
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${PRIORITY[report.urgency] ?? PRIORITY.low}`}>{report.urgency} urgency</span>
                  <span className="text-[10px] text-slate-500">{Math.round(report.confidence * 100)}% confidence</span>
                </div>
                {report.see_vet && (
                  <div className="border rounded-xl p-3 text-sm font-semibold bg-red-500/10 border-red-500/30 text-red-400">See a vet about these birds.</div>
                )}
                <div>
                  <p className={`${label} mb-1`}>What the photo shows</p>
                  <ul className="text-sm text-slate-400 list-disc pl-4 space-y-1">{report.observations.map((o, i) => <li key={i}>{o}</li>)}</ul>
                </div>
                <div>
                  <p className={`${label} mb-1`}>Next steps</p>
                  <ul className="text-sm text-[var(--text-primary)] list-disc pl-4 space-y-1">{report.next_steps.map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
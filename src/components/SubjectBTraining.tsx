import { useState, useEffect, useCallback } from 'react'
import subjectBData from '../data/subject-b-training.json'

interface SubjectBQ {
  id: number
  category: string
  scenario: string
  question: string
  options: string[]
  correct: number
  explanation: string
}

interface SubjectBStats {
  total: number
  correct: number
  byCategory: Record<string, { total: number; correct: number }>
}

const STORAGE_STATS = 'sc-b-stats'

function loadStats(): SubjectBStats {
  try {
    const raw = localStorage.getItem(STORAGE_STATS)
    if (raw) return JSON.parse(raw) as SubjectBStats
  } catch { /* ignore */ }
  return { total: 0, correct: 0, byCategory: {} }
}

function saveStats(s: SubjectBStats) {
  localStorage.setItem(STORAGE_STATS, JSON.stringify(s))
}

const categories = [...new Set(subjectBData.map((q) => q.category))]

export default function SubjectBTraining() {
  const [mode, setMode] = useState<'menu' | 'quiz' | 'result'>('menu')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [pool, setPool] = useState<SubjectBQ[]>([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionTotal, setSessionTotal] = useState(0)
  const [stats, setStats] = useState<SubjectBStats>(loadStats)

  useEffect(() => { setStats(loadStats()) }, [mode])

  const startQuiz = useCallback((qList: SubjectBQ[]) => {
    const shuffled = [...qList].sort(() => Math.random() - 0.5)
    setPool(shuffled)
    setIdx(0)
    setSelected(null)
    setShowExplanation(false)
    setSessionCorrect(0)
    setSessionTotal(0)
    setMode('quiz')
  }, [])

  const startCategory = (cat: string) => {
    setSelectedCategory(cat)
    startQuiz(subjectBData.filter((q) => q.category === cat))
  }

  const handleAnswer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    setShowExplanation(true)
    setSessionTotal((t) => t + 1)
    const q = pool[idx]
    if (i === q.correct) setSessionCorrect((c) => c + 1)
    const newStats = { ...stats, total: stats.total + 1, correct: stats.correct + (i === q.correct ? 1 : 0) }
    const cs = { ...(newStats.byCategory[q.category] || { total: 0, correct: 0 }) }
    cs.total += 1
    if (i === q.correct) cs.correct += 1
    newStats.byCategory[q.category] = cs
    setStats(newStats)
    saveStats(newStats)
  }

  const next = () => {
    if (idx + 1 >= pool.length) { setMode('result'); return }
    setIdx((i) => i + 1)
    setSelected(null)
    setShowExplanation(false)
  }

  if (mode === 'menu') {
    return (
      <div>
        <div className="mb-4 p-3 rounded" style={{ background: '#1a1a3e' }}>
          <p className="text-sm" style={{ color: '#ccc' }}>
            Subject B Practice: {stats.total} answered | {stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) : 0}% accuracy
          </p>
        </div>
        <h2 className="text-white font-bold mb-2">Subject B Training</h2>
        <p className="text-sm mb-4" style={{ color: '#888' }}>Scenario-based questions for Subject B (25 questions, 105 min)</p>
        <div className="grid gap-2">
          {categories.map((cat) => {
            const catQs = subjectBData.filter((q) => q.category === cat)
            const cs = stats.byCategory[cat]
            const rate = cs && cs.total > 0 ? ((cs.correct / cs.total) * 100).toFixed(0) : '-'
            return (
              <button key={cat} onClick={() => startCategory(cat)}
                className="flex justify-between items-center p-3 rounded text-left"
                style={{ background: '#1a1a3e', color: '#ddd' }}>
                <span>{cat}</span>
                <span className="text-sm" style={{ color: '#888' }}>{catQs.length}Q | {rate}%</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (mode === 'result') {
    const pct = sessionTotal > 0 ? ((sessionCorrect / sessionTotal) * 100).toFixed(1) : '0'
    return (
      <div className="text-center">
        <h2 className="text-white text-2xl font-bold mb-4">{selectedCategory} Complete</h2>
        <div className="p-6 rounded mb-4" style={{ background: '#1a1a3e' }}>
          <p className="text-3xl font-bold" style={{ color: '#e74c3c' }}>{pct}%</p>
          <p className="text-sm mt-2" style={{ color: '#aaa' }}>{sessionCorrect} / {sessionTotal}</p>
        </div>
        <button onClick={() => setMode('menu')} className="px-4 py-2 rounded text-white font-bold" style={{ background: '#c0392b' }}>
          Back to Menu
        </button>
      </div>
    )
  }

  const q = pool[idx]
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm" style={{ color: '#888' }}>{idx + 1} / {pool.length}</span>
        <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#2a2a5e', color: '#aaa' }}>{q.category}</span>
      </div>
      <div className="w-full rounded-full h-1.5 mb-4" style={{ background: '#2a2a5e' }}>
        <div className="h-1.5 rounded-full" style={{ background: '#c0392b', width: `${((idx + 1) / pool.length) * 100}%` }} />
      </div>

      <div className="mb-3 p-3 rounded text-sm italic" style={{ background: '#12122a', color: '#aaa', borderLeft: '3px solid #c0392b' }}>
        {q.scenario}
      </div>

      <p className="text-white mb-4 font-medium whitespace-pre-wrap">{q.question}</p>
      <div className="grid gap-2">
        {q.options.map((opt, i) => {
          let bg = '#1a1a3e', border = '#2a2a5e', textColor = '#ddd'
          if (selected !== null) {
            if (i === q.correct) { bg = '#1a4a2e'; border = '#27ae60'; textColor = '#2ecc71' }
            else if (i === selected && i !== q.correct) { bg = '#4a1a1a'; border = '#c0392b'; textColor = '#e74c3c' }
          }
          return (
            <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null}
              className="p-3 rounded text-left border" style={{ background: bg, borderColor: border, color: textColor, opacity: selected !== null && i !== selected && i !== q.correct ? 0.5 : 1 }}>
              <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
            </button>
          )
        })}
      </div>
      {showExplanation && (
        <div className="mt-4 p-3 rounded" style={{ background: '#1a1a3e' }}>
          <p className="text-sm" style={{ color: '#ccc' }}>{q.explanation}</p>
        </div>
      )}
      {selected !== null && (
        <div className="mt-4 flex gap-2">
          <button onClick={next} className="px-4 py-2 rounded text-white font-bold" style={{ background: '#c0392b' }}>
            {idx + 1 >= pool.length ? 'See Results' : 'Next'}
          </button>
          <button onClick={() => setMode('menu')} className="px-4 py-2 rounded text-sm" style={{ color: '#666' }}>Quit</button>
        </div>
      )}
    </div>
  )
}

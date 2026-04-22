import { useState, useEffect, useMemo, useCallback } from 'react'
import questions from '../data/sc-exam.json'

interface Question {
  id: number
  category: string
  question: string
  options: string[]
  correct: number
  explanation: string
}

interface QuizStats {
  total: number
  correct: number
  byCategory: Record<string, { total: number; correct: number }>
}

const categories = [...new Set(questions.map((q) => q.category))]

const STORAGE_WRONG = 'sc-quiz-wrong'
const STORAGE_STATS = 'sc-quiz-stats'

function loadWrongIds(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_WRONG)
    if (raw) return new Set(JSON.parse(raw) as number[])
  } catch { /* ignore */ }
  return new Set()
}

function saveWrongIds(ids: Set<number>) {
  localStorage.setItem(STORAGE_WRONG, JSON.stringify([...ids]))
}

function loadStats(): QuizStats {
  try {
    const raw = localStorage.getItem(STORAGE_STATS)
    if (raw) return JSON.parse(raw) as QuizStats
  } catch { /* ignore */ }
  return { total: 0, correct: 0, byCategory: {} }
}

function saveStats(stats: QuizStats) {
  localStorage.setItem(STORAGE_STATS, JSON.stringify(stats))
}

export default function Quiz() {
  const [mode, setMode] = useState<'menu' | 'all' | 'wrong' | 'category' | 'result'>('menu')
  const [_selectedCategory, setSelectedCategory] = useState('')
  const [pool, setPool] = useState<Question[]>([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionWrong, setSessionWrong] = useState<number[]>([])
  const [stats, setStats] = useState<QuizStats>(loadStats)

  const wrongIds = useMemo(() => loadWrongIds(), [mode])

  useEffect(() => {
    setStats(loadStats())
  }, [mode])

  const startQuiz = useCallback((qList: Question[]) => {
    const shuffled = [...qList].sort(() => Math.random() - 0.5)
    setPool(shuffled)
    setIdx(0)
    setSelected(null)
    setShowExplanation(false)
    setSessionCorrect(0)
    setSessionWrong([])
    setMode('result' in ['result'] ? 'result' : 'all')
  }, [])

  const startAll = () => {
    startQuiz(questions)
    setMode('all')
  }

  const startWrong = () => {
    const wrongQs = questions.filter((q) => wrongIds.has(q.id))
    if (wrongQs.length === 0) return
    startQuiz(wrongQs)
    setMode('wrong')
  }

  const startCategory = (cat: string) => {
    setSelectedCategory(cat)
    startQuiz(questions.filter((q) => q.category === cat))
    setMode('category')
  }

  const handleAnswer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    setShowExplanation(true)
    const q = pool[idx]
    if (i === q.correct) {
      setSessionCorrect((c) => c + 1)
      const newStats = { ...stats, total: stats.total + 1, correct: stats.correct + 1 }
      const catStats = { ...(newStats.byCategory[q.category] || { total: 0, correct: 0 }) }
      catStats.total += 1
      catStats.correct += 1
      newStats.byCategory[q.category] = catStats
      setStats(newStats)
      saveStats(newStats)
      const w = new Set(wrongIds)
      w.delete(q.id)
      saveWrongIds(w)
    } else {
      setSessionWrong((w) => [...w, q.id])
      const newStats = { ...stats, total: stats.total + 1, correct: stats.correct }
      const catStats = { ...(newStats.byCategory[q.category] || { total: 0, correct: 0 }) }
      catStats.total += 1
      newStats.byCategory[q.category] = catStats
      setStats(newStats)
      saveStats(newStats)
      const w = new Set(wrongIds)
      w.add(q.id)
      saveWrongIds(w)
    }
  }

  const next = () => {
    if (idx + 1 >= pool.length) {
      setMode('result')
      return
    }
    setIdx((i) => i + 1)
    setSelected(null)
    setShowExplanation(false)
  }

  const reset = () => {
    if (confirm('Reset all quiz progress?')) {
      localStorage.removeItem(STORAGE_WRONG)
      localStorage.removeItem(STORAGE_STATS)
      setStats({ total: 0, correct: 0, byCategory: {} })
    }
  }

  if (mode === 'menu') {
    return (
      <div>
        <div className="flex gap-4 mb-4 flex-wrap">
          <button onClick={startAll} className="px-4 py-2 rounded text-white font-bold" style={{ background: '#c0392b' }}>
            All Questions ({questions.length})
          </button>
          <button
            onClick={startWrong}
            className="px-4 py-2 rounded text-white font-bold"
            style={{ background: wrongIds.size > 0 ? '#e74c3c' : '#555' }}
            disabled={wrongIds.size === 0}
          >
            Wrong Answers ({wrongIds.size})
          </button>
        </div>
        <div className="mb-4 p-3 rounded" style={{ background: '#1a1a3e' }}>
          <p className="text-sm" style={{ color: '#ccc' }}>
            Total answered: {stats.total} | Correct: {stats.correct} | Rate: {stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <h2 className="text-white font-bold mb-2">Categories</h2>
        <div className="grid gap-2">
          {categories.map((cat) => {
            const catQuestions = questions.filter((q) => q.category === cat)
            const catStats = stats.byCategory[cat]
            const rate = catStats && catStats.total > 0 ? ((catStats.correct / catStats.total) * 100).toFixed(0) : '-'
            return (
              <button
                key={cat}
                onClick={() => startCategory(cat)}
                className="flex justify-between items-center p-3 rounded text-left transition-colors"
                style={{ background: '#1a1a3e', color: '#ddd' }}
              >
                <span>{cat}</span>
                <span className="text-sm" style={{ color: '#888' }}>
                  {catQuestions.length}Q | {rate}%
                </span>
              </button>
            )
          })}
        </div>
        <button onClick={reset} className="mt-6 text-sm" style={{ color: '#666' }}>
          Reset All Progress
        </button>
      </div>
    )
  }

  if (mode === 'result') {
    const total = sessionCorrect + sessionWrong.length
    const pct = total > 0 ? ((sessionCorrect / total) * 100).toFixed(1) : '0'
    return (
      <div className="text-center">
        <h2 className="text-white text-2xl font-bold mb-4">Session Complete</h2>
        <div className="p-6 rounded mb-4" style={{ background: '#1a1a3e' }}>
          <p className="text-3xl font-bold" style={{ color: '#e74c3c' }}>{pct}%</p>
          <p className="text-sm mt-2" style={{ color: '#aaa' }}>
            {sessionCorrect} correct / {total} total
          </p>
        </div>
        {sessionWrong.length > 0 && (
          <p className="text-sm mb-4" style={{ color: '#e74c3c' }}>
            {sessionWrong.length} incorrect - added to wrong answers for review
          </p>
        )}
        <button onClick={() => setMode('menu')} className="px-4 py-2 rounded text-white font-bold" style={{ background: '#c0392b' }}>
          Back to Menu
        </button>
      </div>
    )
  }

  if (pool.length === 0) return null
  const q = pool[idx]

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm" style={{ color: '#888' }}>
          {idx + 1} / {pool.length}
        </span>
        <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#2a2a5e', color: '#aaa' }}>
          {q.category}
        </span>
      </div>
      <div className="w-full rounded-full h-1.5 mb-4" style={{ background: '#2a2a5e' }}>
        <div
          className="h-1.5 rounded-full"
          style={{ background: '#c0392b', width: `${((idx + 1) / pool.length) * 100}%` }}
        />
      </div>
      <p className="text-white mb-4 whitespace-pre-wrap">{q.question}</p>
      <div className="grid gap-2">
        {q.options.map((opt, i) => {
          let bg = '#1a1a3e'
          let border = '#2a2a5e'
          let textColor = '#ddd'
          if (selected !== null) {
            if (i === q.correct) {
              bg = '#1a4a2e'
              border = '#27ae60'
              textColor = '#2ecc71'
            } else if (i === selected && i !== q.correct) {
              bg = '#4a1a1a'
              border = '#c0392b'
              textColor = '#e74c3c'
            }
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={selected !== null}
              className="p-3 rounded text-left border transition-colors"
              style={{ background: bg, borderColor: border, color: textColor, opacity: selected !== null && i !== selected && i !== q.correct ? 0.5 : 1 }}
            >
              <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
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
        <button onClick={next} className="mt-4 px-4 py-2 rounded text-white font-bold" style={{ background: '#c0392b' }}>
          {idx + 1 >= pool.length ? 'See Results' : 'Next'}
        </button>
      )}
      <button onClick={() => setMode('menu')} className="mt-2 ml-2 px-4 py-2 rounded text-sm" style={{ color: '#666' }}>
        Quit
      </button>
    </div>
  )
}

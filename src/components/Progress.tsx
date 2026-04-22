import { useState } from 'react'
import questions from '../data/sc-exam.json'
import calcData from '../data/calc-training.json'
import subjectBData from '../data/subject-b-training.json'

interface CategoryProgress {
  name: string
  total: number
  attempted: number
  correct: number
  rate: string
}

function getQuizStats(): Record<string, { total: number; correct: number }> {
  try {
    const raw = localStorage.getItem('sc-quiz-stats')
    return raw ? JSON.parse(raw).byCategory || {} : {}
  } catch { return {} }
}

function getCalcStats(): Record<string, { total: number; correct: number }> {
  try {
    const raw = localStorage.getItem('sc-calc-stats')
    return raw ? JSON.parse(raw).byCategory || {} : {}
  } catch { return {} }
}

function getSubjectBStats(): Record<string, { total: number; correct: number }> {
  try {
    const raw = localStorage.getItem('sc-b-stats')
    return raw ? JSON.parse(raw).byCategory || {} : {}
  } catch { return {} }
}

function buildProgress(
  data: readonly { category: string; id: number }[],
  stats: Record<string, { total: number; correct: number }>
): CategoryProgress[] {
  const cats = [...new Set(data.map((q) => q.category))]
  return cats.map((cat) => {
    const count = data.filter((q) => q.category === cat).length
    const s = stats[cat]
    return {
      name: cat,
      total: count,
      attempted: s?.total || 0,
      correct: s?.correct || 0,
      rate: s && s.total > 0 ? ((s.correct / s.total) * 100).toFixed(1) : '-',
    }
  })
}

type Section = 'quiz' | 'calc' | 'subjectb'

export default function Progress() {
  const [section, setSection] = useState<Section>('quiz')

  const quizStats = getQuizStats()
  const calcStats = getCalcStats()
  const subjectBStats = getSubjectBStats()

  const sections: { id: Section; label: string; progress: CategoryProgress[] }[] = [
    { id: 'quiz', label: 'Subject A (250Q)', progress: buildProgress(questions, quizStats) },
    { id: 'calc', label: 'Calc Training (120Q)', progress: buildProgress(calcData, calcStats) },
    { id: 'subjectb', label: 'Subject B (100Q)', progress: buildProgress(subjectBData, subjectBStats) },
  ]

  const current = sections.find((s) => s.id === section)!

  const totalAttempted = current.progress.reduce((a, c) => a + c.attempted, 0)
  const totalCorrect = current.progress.reduce((a, c) => a + c.correct, 0)
  const overallRate = totalAttempted > 0 ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : '-'
  const overallPct = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className="px-3 py-1.5 text-sm rounded whitespace-nowrap"
            style={{
              background: section === s.id ? '#c0392b' : '#1a1a3e',
              color: section === s.id ? '#fff' : '#aaa',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="p-4 rounded mb-4" style={{ background: '#1a1a3e' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-bold">{current.label}</span>
          <span className="text-sm" style={{ color: '#aaa' }}>
            {overallRate}% ({totalCorrect}/{totalAttempted})
          </span>
        </div>
        <div className="w-full rounded-full h-3" style={{ background: '#2a2a5e' }}>
          <div
            className="h-3 rounded-full transition-all"
            style={{ background: overallPct >= 80 ? '#27ae60' : overallPct >= 60 ? '#f39c12' : '#e74c3c', width: `${overallPct}%` }}
          />
        </div>
      </div>

      <h3 className="text-white font-bold mb-2">Category Breakdown</h3>
      <div className="grid gap-2">
        {current.progress.map((cat) => {
          const pct = cat.attempted > 0 ? (cat.correct / cat.attempted) * 100 : 0
          const barColor = pct >= 80 ? '#27ae60' : pct >= 60 ? '#f39c12' : '#e74c3c'
          const completeness = cat.total > 0 ? Math.min((cat.attempted / cat.total) * 100, 100) : 0
          return (
            <div key={cat.name} className="p-3 rounded" style={{ background: '#1a1a3e' }}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm" style={{ color: '#ddd' }}>{cat.name}</span>
                <span className="text-xs" style={{ color: '#888' }}>
                  {cat.correct}/{cat.attempted} ({cat.rate}%) | {cat.attempted}/{cat.total} done
                </span>
              </div>
              <div className="flex gap-1">
                <div className="flex-1 rounded-full h-2" style={{ background: '#2a2a5e' }}>
                  <div className="h-2 rounded-full" style={{ background: barColor, width: `${pct}%` }} />
                </div>
                <div className="rounded-full h-2" style={{ background: '#2a2a5e', width: '40px' }}>
                  <div className="h-2 rounded-full" style={{ background: '#3498db', width: `${completeness}%` }} />
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: '#666' }}>Accuracy</span>
                <span className="text-xs" style={{ color: '#666' }}>Coverage</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs" style={{ color: '#555' }}>
          Data stored in localStorage. Clear browser data to reset.
        </p>
      </div>
    </div>
  )
}

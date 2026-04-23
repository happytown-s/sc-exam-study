import { useState } from 'react'
import Quiz from './components/Quiz'
import CalcTraining from './components/CalcTraining'
import SubjectBTraining from './components/SubjectBTraining'
import Progress from './components/Progress'

const tabs = [
  { id: 'quiz', label: '科目A問題集' },
  { id: 'calc', label: '計算トレーニング' },
  { id: 'subjectb', label: '科目B' },
  { id: 'progress', label: '進捗' },
] as const

type TabId = typeof tabs[number]['id']

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('quiz')

  return (
    <div className="min-h-screen" style={{ background: '#0f0f23' }}>
      <header className="sticky top-0 z-50 border-b" style={{ background: '#1a1a3e', borderColor: '#2a2a5e' }}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white">SC Exam Study</h1>
          <p className="text-xs" style={{ color: '#888' }}>Information Security Specialist</p>
        </div>
        <nav className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-3 py-1.5 text-sm rounded-t whitespace-nowrap transition-colors"
              style={{
                background: activeTab === tab.id ? '#c0392b' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#aaa',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-4">
        {activeTab === 'quiz' && <Quiz />}
        {activeTab === 'calc' && <CalcTraining />}
        {activeTab === 'subjectb' && <SubjectBTraining />}
        {activeTab === 'progress' && <Progress />}
      </main>
    </div>
  )
}

export default App

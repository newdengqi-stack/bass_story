'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  generateInterrogationQuestions,
  judgeInterrogationAnswer,
  summarizeInterrogation,
} from '@/lib/interrogation'
import {
  DIFFICULTY_META,
  type Difficulty,
  type InterrogationQuestion,
  type InterrogationSummary,
} from '@/lib/interrogation-types'
import { useSpeechRecognition } from './use-speech-recognition'
import { InterrogationReport } from './interrogation-summary'
import { DifficultyPicker } from './difficulty-picker'
import { AnswerPanel } from './answer-panel'
import { VerdictCard } from './verdict-card'
import { FLIP_MS, toRecordInput, type LiveRecord, type QuestionView, type Stage } from './room-types'

export function InterrogationRoom() {
  const [stage, setStage] = useState<Stage>('setup')
  const [difficulty, setDifficulty] = useState<Difficulty>('strict')
  const [questions, setQuestions] = useState<InterrogationQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [records, setRecords] = useState<LiveRecord[]>([])
  const [summary, setSummary] = useState<InterrogationSummary | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [view, setView] = useState<QuestionView>('question')
  const [answerText, setAnswerText] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [judging, setJudging] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [flipKey, setFlipKey] = useState(0)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { supported: micSupported, listening, toggle: toggleMic } = useSpeechRecognition((text) => {
    setAnswerText((prev) => (prev ? `${prev}${/[。 ]$/.test(prev) ? '' : ' '}${text}` : text))
  })

  // 计时只在「正在作答」时走
  useEffect(() => {
    if (stage !== 'live' || view !== 'question') return
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [stage, view, currentIndex])

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    [],
  )

  const currentQuestion = questions[currentIndex] ?? null
  const isLast = currentIndex === questions.length - 1
  const lastRecord = records[records.length - 1]
  const showVerdict = view === 'verdict' && Boolean(lastRecord)

  /** 翻卡：先播离场动画，再改状态，最后播入场 */
  function flipTo(mutate: () => void) {
    setLeaving(true)
    timeoutRef.current = setTimeout(() => {
      mutate()
      setLeaving(false)
      setFlipKey((k) => k + 1)
    }, FLIP_MS)
  }

  async function handleStart(level: Difficulty) {
    setDifficulty(level)
    setErrorMsg(null)
    setStage('loading-questions')

    const outcome = await generateInterrogationQuestions(level)
    if (!outcome.ok) {
      setErrorMsg(outcome.error)
      setStage('error')
      return
    }

    setQuestions(outcome.data)
    setRecords([])
    setCurrentIndex(0)
    setAnswerText('')
    setElapsed(0)
    setView('question')
    setFlipKey((k) => k + 1)
    setStage('live')
  }

  async function handleSubmit() {
    if (!currentQuestion || !answerText.trim() || judging) return
    if (listening) toggleMic()

    setJudging(true)
    setErrorMsg(null)
    const outcome = await judgeInterrogationAnswer(currentQuestion, answerText.trim(), difficulty)
    setJudging(false)

    if (!outcome.ok) {
      setErrorMsg(outcome.error)
      return
    }

    setRecords((prev) => [
      ...prev,
      { question: currentQuestion, answerText: answerText.trim(), skipped: false, seconds: elapsed, verdict: outcome.data },
    ])
    flipTo(() => setView('verdict'))
  }

  function handleSkip() {
    if (!currentQuestion || judging) return
    if (listening) toggleMic()

    setRecords((prev) => [
      ...prev,
      { question: currentQuestion, answerText: '', skipped: true, seconds: elapsed, verdict: null },
    ])
    flipTo(() => setView('verdict'))
  }

  async function handleNext() {
    if (isLast) {
      setStage('loading-summary')
      const outcome = await summarizeInterrogation(records.map(toRecordInput), difficulty)
      if (!outcome.ok) {
        setErrorMsg(outcome.error)
        setStage('error')
        return
      }
      setSummary(outcome.data)
      setStage('summary')
      return
    }

    flipTo(() => {
      setCurrentIndex((i) => i + 1)
      setAnswerText('')
      setElapsed(0)
      setView('question')
    })
  }

  function handleRestart() {
    setStage('setup')
    setQuestions([])
    setRecords([])
    setSummary(null)
    setCurrentIndex(0)
    setAnswerText('')
    setElapsed(0)
    setView('question')
    setErrorMsg(null)
  }

  if (stage === 'setup' || stage === 'error') {
    return <DifficultyPicker errorMsg={stage === 'error' ? errorMsg : null} onStart={handleStart} />
  }

  if (stage === 'loading-questions' || stage === 'loading-summary') {
    return (
      <LoadingStage
        text={stage === 'loading-questions' ? '正在根据你的项目经历出题……' : '审讯结束，正在整理结案报告……'}
      />
    )
  }

  if (stage === 'summary' && summary) {
    return (
      <InterrogationReport
        summary={summary}
        review={records.map((r) => ({
          category: r.question.category,
          prompt: r.question.prompt,
          answerText: r.answerText,
          skipped: r.skipped,
          seconds: r.seconds,
          correct: r.verdict?.correct ?? null,
        }))}
        onRestart={handleRestart}
      />
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="mt-10">
      {/* 进度 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          {questions.map((q, i) => (
            <span
              key={q.id}
              className={cn(
                'h-1.5 w-6 rounded-full transition-colors',
                i < currentIndex ? 'bg-[var(--ws-sand)]' : i === currentIndex ? 'bg-[var(--ws-ink)]' : 'bg-[var(--ws-ghost)]',
              )}
            />
          ))}
        </div>
        <span className="text-[12px] text-[var(--ws-muted)]">
          第 {currentIndex + 1} / {questions.length} 题 · {DIFFICULTY_META[difficulty].label}
        </span>
      </div>

      <div className="interrogate-stage mt-6">
        <div key={flipKey} className={cn('interrogate-card', leaving ? 'interrogate-flip-out' : 'interrogate-flip-in')}>
          {showVerdict ? (
            <VerdictCard record={lastRecord} onNext={handleNext} isLast={isLast} />
          ) : (
            <AnswerPanel
              question={currentQuestion}
              elapsed={elapsed}
              answerText={answerText}
              onAnswerChange={setAnswerText}
              micSupported={micSupported}
              listening={listening}
              onToggleMic={toggleMic}
              judging={judging}
              errorMsg={errorMsg}
              onSubmit={handleSubmit}
              onSkip={handleSkip}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingStage({ text }: { text: string }) {
  return (
    <div className="mt-16 flex flex-col items-center gap-3 py-16 text-[var(--ws-muted)]">
      <Loader2 className="size-6 animate-spin" aria-hidden="true" />
      <p className="text-[14px]">{text}</p>
    </div>
  )
}

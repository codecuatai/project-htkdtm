'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  Sparkles,
  Target,
} from 'lucide-react'
import { useAppStore } from '../../stores/appStore'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useToast } from '../../components/ui/useToast'
import { cn } from '../../utils/cn'

export interface IntakeTestResult {
  score: number
  total: number
  percentage: number
  level: 'Cơ bản' | 'Trung cấp' | 'Nâng cao'
  completedAt: string
  recommendedTrack: string
}

interface Question {
  id: number
  topic: string
  question: string
  options: string[]
  correctIndex: number
}

const INTAKE_QUESTIONS: Question[] = [
  {
    id: 1,
    topic: 'Tư duy lập trình',
    question: 'Độ phức tạp thời gian trung bình của thuật toán tìm kiếm nhị phân (Binary Search) trên mảng đã sắp xếp là gì?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctIndex: 1,
  },
  {
    id: 2,
    topic: 'Cơ sở dữ liệu',
    question: 'Trong SQL, mệnh đề nào được dùng để lọc các nhóm dữ liệu sau khi đã thực hiện GROUP BY?',
    options: ['WHERE', 'ORDER BY', 'HAVING', 'DISTINCT'],
    correctIndex: 2,
  },
  {
    id: 3,
    topic: 'Phát triển Web',
    question: 'Mã trạng thái HTTP 403 Forbidden có ý nghĩa gì?',
    options: [
      'Không tìm thấy tài nguyên yêu cầu',
      'Lỗi máy chủ nội bộ',
      'Người dùng chưa đăng nhập',
      'Máy chủ hiểu yêu cầu nhưng từ chối cấp quyền truy cập',
    ],
    correctIndex: 3,
  },
  {
    id: 4,
    topic: 'Kiến trúc hệ thống',
    question: 'Trong mô hình RESTful API, phương thức HTTP nào thường dùng để cập nhật một phần dữ liệu của tài nguyên?',
    options: ['GET', 'POST', 'PATCH', 'DELETE'],
    correctIndex: 2,
  },
  {
    id: 5,
    topic: 'AI & Dữ liệu',
    question: 'Hiện tượng mô hình học máy hoạt động rất tốt trên tập huấn luyện nhưng kém trên dữ liệu mới gọi là gì?',
    options: ['Overfitting', 'Underfitting', 'Normalization', 'Tokenization'],
    correctIndex: 0,
  },
]

export function getIntakeStorageKey(userKey?: string) {
  return `smartedu_intake_result_${userKey || 'guest'}`
}

export function IntakeTest() {
  const router = useRouter()
  const toast = useToast()
  const user = useAppStore((s) => s.auth.user)
  const storageKey = getIntakeStorageKey(user?.email || user?.id)

  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<IntakeTestResult | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        setResult(JSON.parse(saved) as IntakeTestResult)
      }
    } catch {
      // Ignore parse errors
    }
  }, [storageKey])

  const currentQuestion = INTAKE_QUESTIONS[currentIndex]
  const answeredCount = Object.keys(answers).length
  const progressPct = Math.round(((currentIndex + 1) / INTAKE_QUESTIONS.length) * 100)

  const handleSelectOption = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }))
  }

  const handleSubmit = () => {
    if (answeredCount < INTAKE_QUESTIONS.length) {
      toast({
        type: 'warning',
        title: `Bạn mới trả lời ${answeredCount}/${INTAKE_QUESTIONS.length} câu hỏi`,
      })
      return
    }

    let score = 0
    INTAKE_QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correctIndex) score += 1
    })

    const percentage = Math.round((score / INTAKE_QUESTIONS.length) * 100)
    let level: IntakeTestResult['level'] = 'Cơ bản'
    let recommendedTrack = 'Lộ trình Nền tảng: Củng cố tư duy thuật toán, SQL cơ bản và Web nền tảng.'

    if (percentage >= 80) {
      level = 'Nâng cao'
      recommendedTrack = 'Lộ trình Chuyên sâu: Thiết kế hệ thống, tối ưu hiệu năng và ứng dụng AI thực chiến.'
    } else if (percentage >= 50) {
      level = 'Trung cấp'
      recommendedTrack = 'Lộ trình Thực hành: Xây dựng dự án Full-stack, REST API và phân tích dữ liệu.'
    }

    const newResult: IntakeTestResult = {
      score,
      total: INTAKE_QUESTIONS.length,
      percentage,
      level,
      completedAt: new Date().toISOString(),
      recommendedTrack,
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(newResult))
    } catch {
      // Ignore storage quota errors
    }

    setResult(newResult)
    setStep('result')
    toast({ type: 'success', title: 'Đã hoàn thành bài kiểm tra đầu vào!' })
  }

  const handleStartOver = () => {
    setAnswers({})
    setCurrentIndex(0)
    setStep('quiz')
  }

  if (step === 'intro') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in font-body">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-accent/5 to-surface-elevated p-6 sm:p-8 shadow-soft space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="primary" label="Đánh giá năng lực đầu vào" dot />
            {result && <Badge variant="success" label={`Trình độ hiện tại: ${result.level}`} />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Bài kiểm tra đầu vào (Intake Test)
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Hoàn thành nhanh 5 câu hỏi trắc nghiệm để hệ thống SmartEdu xác định đúng trình độ hiện tại và gợi ý lộ trình học tập phù hợp nhất cho bạn.
          </p>

          <div className="grid gap-3 sm:grid-cols-3 pt-2">
            <div className="rounded-xl border border-border/80 bg-surface-elevated/80 p-3.5">
              <p className="text-xs text-muted-foreground">Số lượng câu hỏi</p>
              <p className="text-lg font-bold text-foreground mt-0.5">5 câu trắc nghiệm</p>
            </div>
            <div className="rounded-xl border border-border/80 bg-surface-elevated/80 p-3.5">
              <p className="text-xs text-muted-foreground">Thời gian dự kiến</p>
              <p className="text-lg font-bold text-foreground mt-0.5">~ 3 phút</p>
            </div>
            <div className="rounded-xl border border-border/80 bg-surface-elevated/80 p-3.5">
              <p className="text-xs text-muted-foreground">Kết quả</p>
              <p className="text-lg font-bold text-foreground mt-0.5">Chấm điểm tức thì</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Button onClick={handleStartOver} icon={<ClipboardCheck className="h-4 w-4" />}>
              {result ? 'Làm lại bài kiểm tra' : 'Bắt đầu làm bài ngay'}
            </Button>
            {result && (
              <Button variant="outline" onClick={() => setStep('result')}>
                Xem lại kết quả gần nhất
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (step === 'result' && result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in font-body">
        <Card padding="responsive" className="border-border shadow-soft bg-surface-elevated space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Hoàn thành đánh giá
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Trình độ đề xuất: {result.level}
                </h1>
              </div>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-center">
              <p className="text-xs text-muted-foreground">Điểm số của bạn</p>
              <p className="text-2xl font-bold text-primary tabular-nums">
                {result.score}/{result.total} ({result.percentage}%)
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Lộ trình gợi ý cho bạn</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.recommendedTrack}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button variant="outline" onClick={handleStartOver} icon={<RotateCcw className="h-4 w-4" />}>
              Làm lại bài kiểm tra
            </Button>
            <div className="flex flex-wrap gap-2.5">
              <Button variant="outline" onClick={() => router.push('/app/student/profile')}>
                Về hồ sơ học tập
              </Button>
              <Button onClick={() => router.push('/app/student/browse')} icon={<Target className="h-4 w-4" />}>
                Khám phá khóa học phù hợp
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in font-body">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            Câu {currentIndex + 1} / {INTAKE_QUESTIONS.length} · <strong className="text-foreground">{currentQuestion.topic}</strong>
          </span>
          <span className="tabular-nums">{progressPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card padding="responsive" className="border-border shadow-soft bg-surface-elevated space-y-6">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-snug">
          {currentQuestion.question}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const selected = answers[currentQuestion.id] === idx
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all',
                  selected
                    ? 'border-primary bg-primary/10 text-foreground font-medium shadow-xs'
                    : 'border-border bg-background hover:border-primary/40 hover:bg-muted/40 text-foreground/90'
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                    selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground'
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{option}</span>
                {selected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
              </button>
            )
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Câu trước
          </Button>

          {currentIndex < INTAKE_QUESTIONS.length - 1 ? (
            <Button
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Câu tiếp theo
            </Button>
          ) : (
            <Button onClick={handleSubmit} icon={<CheckCircle2 className="h-4 w-4" />}>
              Nộp bài & Xem kết quả
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
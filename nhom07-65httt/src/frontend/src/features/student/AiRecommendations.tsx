'use client'

/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ExternalLink,
  Info,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import api, { coursesApi, type Course } from '../../services/api'
import { useAppStore } from '../../stores/appStore'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { cn } from '../../utils/cn'
import { normalizeCourseMeta } from '../courses/courseMeta'

type ModelVersion = 'M0' | 'M1' | 'M2'

interface ComponentScores {
  S: number // Semantic match (0-100)
  G: number // Skill gap coverage (0-100)
  L: number // Level fit (0-100)
}

interface RecommendationItem {
  rank: number
  course_id: string
  title: string
  description?: string
  price: number
  is_external: boolean
  source_name: string
  external_url: string | null
  level_label: string
  match_score: number
  scores: ComponentScores
  skills_to_gain: string[]
  reasons: string[]
  model_version: ModelVersion
}

interface SavedLearningProfile {
  career_goal?: string
  skills?: string[]
  level?: string
  max_budget?: number | string
  hours_per_week?: number | string
}

const MODEL_OPTIONS: { id: ModelVersion; label: string; desc: string }[] = [
  { id: 'M0', label: 'M0 · Baseline', desc: 'Khớp từ khóa & danh mục cơ bản' },
  { id: 'M1', label: 'M1 · Semantic + Gap', desc: 'Kết hợp ngữ nghĩa (S) và bù thiếu kỹ năng (G)' },
  { id: 'M2', label: 'M2 · Hybrid Full', desc: 'Tối ưu toàn diện S + G + Cấp độ (L) & Ngân sách' },
]

function readSavedProfile(userId?: string): SavedLearningProfile | null {
  if (typeof window === 'undefined') return null
  const keys = [
    userId ? `smartedu_student_profile_${userId}` : '',
    'smartedu_student_profile',
    userId ? `smartedu_intake_test_${userId}` : '',
    'smartedu_intake_test',
  ].filter(Boolean)

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw) as SavedLearningProfile
        if (parsed && typeof parsed === 'object') return parsed
      }
    } catch {
      // ignore invalid JSON
    }
  }
  return null
}

function detectMissingFields(profile: SavedLearningProfile | null): string[] {
  if (!profile) {
    return ['Mục tiêu nghề nghiệp', 'Kỹ năng hiện có', 'Cấp độ hiện tại', 'Ngân sách tối đa', 'Số giờ học/tuần']
  }
  const missing: string[] = []
  if (!profile.career_goal) missing.push('Mục tiêu nghề nghiệp')
  if (!Array.isArray(profile.skills) || profile.skills.length === 0) missing.push('Kỹ năng hiện có')
  if (!profile.level) missing.push('Cấp độ hiện tại')
  if (profile.max_budget === undefined || profile.max_budget === '') missing.push('Ngân sách tối đa')
  if (profile.hours_per_week === undefined || profile.hours_per_week === '') missing.push('Số giờ học/tuần')
  return missing
}

function buildFallbackRecommendations(
  courses: Course[],
  profile: SavedLearningProfile | null,
  model: ModelVersion
): RecommendationItem[] {
  const userSkills = (profile?.skills || []).map((s) => s.toLowerCase())
  const goalText = (profile?.career_goal || '').toLowerCase()
  const userLevel = (profile?.level || 'beginner').toLowerCase()

  const scored = courses.map((course, idx) => {
    const meta = normalizeCourseMeta(course)
    const haystack = `${course.title} ${course.description || ''} ${course.category?.name || ''}`.toLowerCase()

    // S: Semantic / Goal match
    let sScore = 62 + ((idx * 7) % 24)
    if (goalText && haystack.includes(goalText.split(' ')[0] || '')) {
      sScore = Math.min(98, sScore + 15)
    }

    // G: Skill gap coverage
    const skillsToGain = meta.skills.filter((sk) => !userSkills.includes(sk.toLowerCase()))
    const gScore = skillsToGain.length > 0 ? Math.min(96, 68 + skillsToGain.length * 8) : 58

    // L: Level fit
    const lScore = meta.level === userLevel ? 94 : meta.level === 'intermediate' ? 78 : 66

    // Weighting by model version M0 / M1 / M2
    let total: number
    if (model === 'M0') {
      total = Math.round(sScore * 0.8 + gScore * 0.1 + lScore * 0.1)
    } else if (model === 'M1') {
      total = Math.round(sScore * 0.5 + gScore * 0.4 + lScore * 0.1)
    } else {
      total = Math.round(sScore * 0.4 + gScore * 0.35 + lScore * 0.25)
    }

    const reasons: string[] = []
    if (goalText) {
      reasons.push(`Nội dung bám sát mục tiêu "${profile?.career_goal}" với điểm ngữ nghĩa S = ${sScore}%.`)
    } else {
      reasons.push(`Chủ đề phù hợp với lộ trình phổ biến trên SmartEdu (S = ${sScore}%).`)
    }
    if (skillsToGain.length > 0) {
      reasons.push(`Bổ sung trực tiếp ${skillsToGain.length} kỹ năng còn thiếu: ${skillsToGain.slice(0, 3).join(', ')}.`)
    }
    reasons.push(`Cấp độ "${meta.levelLabel}" tương thích ${lScore}% với năng lực hiện tại.`)

    return {
      rank: 0,
      course_id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      is_external: meta.isExternal,
      source_name: meta.sourceName,
      external_url: meta.externalUrl,
      level_label: meta.levelLabel,
      match_score: Math.min(99, Math.max(40, total)),
      scores: { S: sScore, G: gScore, L: lScore },
      skills_to_gain: skillsToGain.length > 0 ? skillsToGain : meta.skills,
      reasons,
      model_version: model,
    }
  })

  return scored
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 6)
    .map((item, index) => ({ ...item, rank: index + 1 }))
}

export function AiRecommendations() {
  const user = useAppStore((s) => s.auth.user)
  const [modelVersion, setModelVersion] = useState<ModelVersion>('M2')
  const [items, setItems] = useState<RecommendationItem[]>([])
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isFallbackMode, setIsFallbackMode] = useState(false)

  const loadRecommendations = useCallback(async (selectedModel: ModelVersion) => {
    setLoading(true)
    setErrorMsg(null)
    setIsFallbackMode(false)

    const profile = readSavedProfile(user?.id)
    const missing = detectMissingFields(profile)
    setMissingFields(missing)

    try {
      // 1. Try real backend recommendation API first
      const res = await api.get('/api/v1/recommendations', {
        params: { model_version: selectedModel, top_k: 6 },
      })
      const payload = res.data as {
        items?: RecommendationItem[]
        missing_fields?: string[]
      }

      if (Array.isArray(payload?.missing_fields)) {
        setMissingFields(payload.missing_fields)
      }

      if (Array.isArray(payload?.items) && payload.items.length > 0) {
        setItems(payload.items)
        return
      }
      throw new Error('empty_api_payload')
    } catch {
      // 2. Fallback to explainable scoring from published courses
      try {
        const courseRes = await coursesApi.list({ status: 'published', page_size: 30 })
        const list = courseRes.data.items || []
        if (list.length === 0) {
          setItems([])
        } else {
          setItems(buildFallbackRecommendations(list, profile, selectedModel))
          setIsFallbackMode(true)
        }
      } catch {
        setErrorMsg('Không thể kết nối dịch vụ gợi ý AI lúc này. Vui lòng thử lại sau.')
        setItems([])
      }
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadRecommendations(modelVersion)
  }, [modelVersion, loadRecommendations])

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price)

  return (
    <div className="space-y-6 animate-fade-in font-body pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-surface-elevated via-purple-500/5 to-primary/5 p-5 sm:p-7 shadow-soft space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Gợi ý AI Top-K & Giải thích</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Khóa học đề xuất riêng cho bạn
            </h1>
            <p className="text-sm text-muted-foreground">
              Hệ thống phân tích hồ sơ học tập để xếp hạng Top-K khóa học kèm giải thích minh bạch theo 3 thành phần: Ngữ nghĩa (S), Bù thiếu kỹ năng (G) và Cấp độ (L).
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadRecommendations(modelVersion)}
            disabled={loading}
            icon={<RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />}
          >
            Tính lại gợi ý
          </Button>
        </div>

        {/* Model Switcher M0 / M1 / M2 */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Mô hình demo:</span>
          {MODEL_OPTIONS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModelVersion(m.id)}
              title={m.desc}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
                modelVersion === m.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground hover:border-primary/40'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Mandatory Disclaimer */}
        <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground/90">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>
            <strong>Lưu ý về điểm gợi ý:</strong> Điểm phần trăm hiển thị là <strong>mức độ phù hợp</strong> giữa khóa học với hồ sơ hiện tại của bạn (không phải xác suất đỗ hay cam kết thành công).
            {isFallbackMode && ' (Đang chạy chế độ mô phỏng cục bộ khi API gợi ý chưa phản hồi).'}
          </p>
        </div>
      </div>

      {/* Missing Profile Fields Warning */}
      {missingFields.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-foreground">
                Hồ sơ học tập còn thiếu {missingFields.length} thông tin
              </p>
              <p className="text-muted-foreground">
                Các trường chưa điền: <span className="font-medium text-foreground">{missingFields.join(', ')}</span>. Bổ sung đầy đủ sẽ giúp mô hình {modelVersion} gợi ý chính xác hơn.
              </p>
            </div>
          </div>
          <Link href="/app/student/profile" className="shrink-0">
            <Button size="sm" variant="outline" icon={<UserCheck className="h-4 w-4" />}>
              Cập nhật hồ sơ
            </Button>
          </Link>
        </div>
      )}

      {/* Content States: Loading / Error / Empty / Results */}
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Brain className="h-4 w-4 animate-pulse text-primary" />
            <span>Đang tính toán xếp hạng Top-K với mô hình {modelVersion}...</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} padding="responsive" className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        </div>
      ) : errorMsg ? (
        <Card padding="responsive" className="text-center py-10 space-y-3">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
          <h3 className="text-base font-bold text-foreground">Không thể tải gợi ý AI</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">{errorMsg}</p>
          <Button size="sm" onClick={() => loadRecommendations(modelVersion)}>
            Thử lại
          </Button>
        </Card>
      ) : items.length === 0 ? (
        <Card padding="responsive" className="text-center py-10 space-y-3">
          <Sparkles className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">Chưa có khóa học gợi ý phù hợp</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Hãy cập nhật hồ sơ năng lực hoặc làm bài kiểm tra đầu vào để hệ thống phân tích kỹ năng của bạn.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Link href="/app/student/intake-test">
              <Button size="sm">Làm kiểm tra đầu vào</Button>
            </Link>
            <Link href="/app/student/browse">
              <Button size="sm" variant="outline">Xem toàn bộ danh mục</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {items.map((item) => (
            <Card
              key={item.course_id}
              padding="responsive"
              className="flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all"
            >
              <div className="space-y-3.5">
                {/* Top Row: Rank + Badges + Match Score */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold">
                      #{item.rank}
                    </span>
                    <Badge variant="primary" label={`Model: ${item.model_version}`} />
                    {item.is_external ? (
                      <Badge variant="warning" label="Tham khảo ngoài" />
                    ) : (
                      <Badge variant="success" label="Nội bộ SmartEdu" />
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xl font-extrabold text-primary leading-none">
                      {item.match_score}%
                    </div>
                    <div className="text-3xs text-muted-foreground font-medium mt-0.5">
                      Độ phù hợp
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* S / G / L Component Score Bars */}
                <div className="rounded-xl bg-muted/40 border border-border/60 p-3 space-y-2">
                  {[
                    { code: 'S', label: 'Ngữ nghĩa (S)', value: item.scores.S, color: 'bg-blue-500' },
                    { code: 'G', label: 'Khoảng thiếu kỹ năng (G)', value: item.scores.G, color: 'bg-emerald-500' },
                    { code: 'L', label: 'Tương thích cấp độ (L)', value: item.scores.L, color: 'bg-purple-500' },
                  ].map((bar) => (
                    <div key={bar.code} className="space-y-1">
                      <div className="flex justify-between text-2xs">
                        <span className="text-muted-foreground font-medium">{bar.label}</span>
                        <span className="font-bold text-foreground">{bar.value}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-500', bar.color)}
                          style={{ width: `${Math.min(100, Math.max(0, bar.value))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skills to Gain */}
                {item.skills_to_gain.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                      Kỹ năng sẽ bổ sung
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.skills_to_gain.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-2xs font-semibold"
                        >
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explainable Reasons */}
                <div className="space-y-1.5">
                  <div className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                    Lý do đề xuất
                  </div>
                  <ul className="space-y-1">
                    {item.reasons.map((reason, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-1.5 text-xs text-foreground/90">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer Action */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {item.is_external ? (
                    <span>Nguồn: {item.source_name}</span>
                  ) : (
                    <span className="text-foreground font-bold">
                      {item.price === 0 ? 'Miễn phí' : `${formatPrice(item.price)}đ`}
                    </span>
                  )}
                </div>

                {item.is_external && item.external_url ? (
                  <a href={item.external_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" icon={<ExternalLink className="h-3.5 w-3.5" />}>
                      Xem tại nguồn gốc
                    </Button>
                  </a>
                ) : (
                  <Link href={`/app/student/courses/${item.course_id}`}>
                    <Button size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>
                      Xem chi tiết
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
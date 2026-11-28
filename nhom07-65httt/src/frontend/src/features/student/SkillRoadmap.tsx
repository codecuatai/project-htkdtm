'use client'

/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flag,
  Layers,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Target,
} from 'lucide-react'
import api, { coursesApi, type Course } from '../../services/api'
import { useAppStore } from '../../stores/appStore'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { cn } from '../../utils/cn'
import { normalizeCourseMeta } from '../courses/courseMeta'

type StepStatus = 'achieved' | 'prerequisite' | 'target'

interface RoadmapCourse {
  course_id: string
  title: string
  level_label: string
  duration_hours: number
  is_external: boolean
  external_url: string | null
  source_name: string
  price: number
}

interface RoadmapStep {
  id: string
  order: number
  skill_name: string
  status: StepStatus
  description: string
  prerequisites: string[]
  estimated_hours: number
  courses: RoadmapCourse[]
}

interface SavedProfile {
  career_goal?: string
  skills?: string[]
  level?: string
}

const STATUS_META: Record<
  StepStatus,
  { label: string; dotClass: string; borderClass: string; bgClass: string; badgeVariant: 'success' | 'warning' | 'primary' }
> = {
  achieved: {
    label: 'Kỹ năng đã đạt',
    dotClass: 'bg-emerald-500 ring-emerald-500/20',
    borderClass: 'border-emerald-500/35',
    bgClass: 'bg-emerald-500/5',
    badgeVariant: 'success',
  },
  prerequisite: {
    label: 'Nền tảng cần học trước',
    dotClass: 'bg-amber-500 ring-amber-500/20',
    borderClass: 'border-amber-500/40',
    bgClass: 'bg-amber-500/5',
    badgeVariant: 'warning',
  },
  target: {
    label: 'Kỹ năng mục tiêu',
    dotClass: 'bg-purple-500 ring-purple-500/20',
    borderClass: 'border-purple-500/40',
    bgClass: 'bg-purple-500/5',
    badgeVariant: 'primary',
  },
}

function readSavedProfile(userId?: string): SavedProfile | null {
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
        const parsed = JSON.parse(raw) as SavedProfile
        if (parsed && typeof parsed === 'object') return parsed
      }
    } catch {
      // ignore invalid JSON
    }
  }
  return null
}

function toRoadmapCourse(course: Course): RoadmapCourse {
  const meta = normalizeCourseMeta(course)
  return {
    course_id: course.id,
    title: course.title,
    level_label: meta.levelLabel,
    duration_hours: meta.durationHours,
    is_external: meta.isExternal,
    external_url: meta.externalUrl,
    source_name: meta.sourceName,
    price: course.price,
  }
}

function buildFallbackRoadmap(courses: Course[], profile: SavedProfile | null): RoadmapStep[] {
  const achievedSkills = (profile?.skills || []).slice(0, 2)
  const careerGoal = profile?.career_goal || 'Kỹ sư Phần mềm / Dữ liệu'
  const mappedCourses = courses.map(toRoadmapCourse)

  const pickCourses = (startIdx: number, count: number): RoadmapCourse[] => {
    if (mappedCourses.length === 0) return []
    const result: RoadmapCourse[] = []
    for (let i = 0; i < count && i < mappedCourses.length; i += 1) {
      result.push(mappedCourses[(startIdx + i) % mappedCourses.length])
    }
    return result
  }

  const steps: RoadmapStep[] = []
  let order = 1

  // 1. Achieved skills
  const baseAchieved = achievedSkills.length > 0 ? achievedSkills : ['Tư duy lập trình cơ bản']
  baseAchieved.forEach((skill, idx) => {
    steps.push({
      id: `step-achieved-${idx}`,
      order: order++,
      skill_name: skill,
      status: 'achieved',
      description: 'Bạn đã có nền tảng ở kỹ năng này từ hồ sơ học tập / bài kiểm tra đầu vào.',
      prerequisites: [],
      estimated_hours: 4,
      courses: pickCourses(idx, 1),
    })
  })

  // 2. Prerequisite foundation skills
  const prereq1Name = 'Cơ sở dữ liệu & SQL thực hành'
  steps.push({
    id: 'step-prereq-1',
    order: order++,
    skill_name: prereq1Name,
    status: 'prerequisite',
    description: 'Điều kiện tiên quyết quan trọng để xử lý dữ liệu và xây dựng ứng dụng thực tế.',
    prerequisites: [baseAchieved[baseAchieved.length - 1]],
    estimated_hours: 10,
    courses: pickCourses(2, 2),
  })

  const prereq2Name = 'Kiến trúc Hệ thống & API chuẩn hóa'
  steps.push({
    id: 'step-prereq-2',
    order: order++,
    skill_name: prereq2Name,
    status: 'prerequisite',
    description: 'Củng cố tư duy thiết kế luồng dữ liệu, tích hợp dịch vụ và tối ưu hiệu năng.',
    prerequisites: [prereq1Name],
    estimated_hours: 12,
    courses: pickCourses(4, 2),
  })

  // 3. Target skills
  steps.push({
    id: 'step-target-1',
    order: order++,
    skill_name: `Chuyên sâu: ${careerGoal}`,
    status: 'target',
    description: 'Kỹ năng mục tiêu giúp bạn hoàn thiện năng lực nghề nghiệp và sẵn sàng làm dự án thực tế.',
    prerequisites: [prereq1Name, prereq2Name],
    estimated_hours: 18,
    courses: pickCourses(6, 2),
  })

  return steps
}

export function SkillRoadmap() {
  const user = useAppStore((s) => s.auth.user)
  const [steps, setSteps] = useState<RoadmapStep[]>([])
  const [careerGoal, setCareerGoal] = useState<string>('Phát triển năng lực theo mục tiêu')
  const [filterStatus, setFilterStatus] = useState<'all' | StepStatus>('all')
  const [loading, setLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)

  const loadRoadmap = useCallback(async () => {
    setLoading(true)
    setIsFallback(false)

    const profile = readSavedProfile(user?.id)
    if (profile?.career_goal) {
      setCareerGoal(profile.career_goal)
    }

    try {
      const res = await api.get('/api/v1/roadmap')
      const payload = res.data as {
        career_goal?: string
        steps?: RoadmapStep[]
      }
      if (payload?.career_goal) setCareerGoal(payload.career_goal)
      if (Array.isArray(payload?.steps) && payload.steps.length > 0) {
        setSteps(payload.steps)
        return
      }
      throw new Error('empty_roadmap')
    } catch {
      try {
        const courseRes = await coursesApi.list({ status: 'published', page_size: 20 })
        const list = courseRes.data.items || []
        setSteps(buildFallbackRoadmap(list, profile))
        setIsFallback(true)
      } catch {
        setSteps(buildFallbackRoadmap([], profile))
        setIsFallback(true)
      }
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadRoadmap()
  }, [loadRoadmap])

  // Determine the current step ("Bạn đang ở đây") = first non-achieved step
  const currentStepId = useMemo(() => {
    const next = steps.find((s) => s.status !== 'achieved')
    return next ? next.id : steps[steps.length - 1]?.id || null
  }, [steps])

  const visibleSteps = useMemo(() => {
    if (filterStatus === 'all') return steps
    return steps.filter((s) => s.status === filterStatus)
  }, [steps, filterStatus])

  const summary = useMemo(() => {
    const achieved = steps.filter((s) => s.status === 'achieved').length
    const prereq = steps.filter((s) => s.status === 'prerequisite').length
    const target = steps.filter((s) => s.status === 'target').length
    const totalHours = steps.reduce((acc, s) => acc + s.estimated_hours, 0)
    return { achieved, prereq, target, totalHours }
  }, [steps])

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price)

  return (
    <div className="space-y-6 animate-fade-in font-body pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-surface-elevated via-primary/5 to-emerald-500/5 p-5 sm:p-7 shadow-soft space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Layers className="h-3.5 w-3.5" />
              <span>Lộ trình kỹ năng SmartEdu</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Lộ trình học tập theo điều kiện tiên quyết
            </h1>
            <p className="text-sm text-muted-foreground">
              Mục tiêu hiện tại: <strong className="text-foreground">{careerGoal}</strong>. Theo dõi chính xác vị trí hiện tại của bạn, kỹ năng nền tảng cần học trước và khóa học tương ứng ở từng bước.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadRoadmap}
            disabled={loading}
            icon={<RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />}
          >
            Làm mới lộ trình
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
            <div className="text-2xs font-semibold text-emerald-700 dark:text-emerald-400">Đã đạt</div>
            <div className="text-xl font-extrabold text-foreground">{summary.achieved} kỹ năng</div>
          </div>
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
            <div className="text-2xs font-semibold text-amber-700 dark:text-amber-400">Nền tảng cần học</div>
            <div className="text-xl font-extrabold text-foreground">{summary.prereq} bước</div>
          </div>
          <div className="rounded-xl border border-purple-500/25 bg-purple-500/5 p-3">
            <div className="text-2xs font-semibold text-purple-700 dark:text-purple-400">Kỹ năng mục tiêu</div>
            <div className="text-xl font-extrabold text-foreground">{summary.target} bước</div>
          </div>
          <div className="rounded-xl border border-border bg-background/80 p-3">
            <div className="text-2xs font-semibold text-muted-foreground">Tổng thời lượng</div>
            <div className="text-xl font-extrabold text-foreground">~{summary.totalHours} giờ</div>
          </div>
        </div>

        {/* Color Legend & Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Tất cả bước' },
              { id: 'achieved', label: 'Đã đạt' },
              { id: 'prerequisite', label: 'Nền tảng cần học trước' },
              { id: 'target', label: 'Kỹ năng mục tiêu' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id as 'all' | StepStatus)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
                  filterStatus === tab.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-background text-muted-foreground border-border hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isFallback && (
            <span className="text-2xs text-muted-foreground">
              Đang hiển thị lộ trình gợi ý từ hồ sơ cục bộ & danh mục khóa học
            </span>
          )}
        </div>
      </div>

      {/* Interactive Timeline */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="responsive" className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6">
          {/* Vertical Timeline Connector Line */}
          <div className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-0.5 bg-border" />

          {visibleSteps.map((step) => {
            const style = STATUS_META[step.status]
            const isCurrent = step.id === currentStepId

            return (
              <div key={step.id} className="relative">
                {/* Timeline Node Dot */}
                <span
                  className={cn(
                    'absolute -left-6 sm:-left-8 top-6 flex h-5 w-5 items-center justify-center rounded-full ring-4',
                    style.dotClass
                  )}
                >
                  {step.status === 'achieved' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  ) : step.status === 'target' ? (
                    <Target className="h-3 w-3 text-white" />
                  ) : (
                    <Flag className="h-3 w-3 text-white" />
                  )}
                </span>

                <Card
                  padding="responsive"
                  className={cn(
                    'space-y-4 transition-all border-2',
                    style.borderClass,
                    style.bgClass,
                    isCurrent && 'ring-2 ring-primary/40 shadow-soft'
                  )}
                >
                  {/* Step Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                          Bước {step.order}
                        </span>
                        <Badge variant={style.badgeVariant} label={style.label} />
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-3xs font-bold animate-pulse">
                            <MapPin className="h-3 w-3" />
                            Bạn đang ở đây
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-foreground">{step.skill_name}</h2>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-background/80 px-2.5 py-1 rounded-lg border border-border/60">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>~{step.estimated_hours} giờ</span>
                    </div>
                  </div>

                  {/* Prerequisites */}
                  {step.prerequisites.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-2xs">
                      <span className="font-bold text-muted-foreground uppercase tracking-wider">
                        Điều kiện tiên quyết:
                      </span>
                      {step.prerequisites.map((pre) => (
                        <span
                          key={pre}
                          className="px-2 py-0.5 rounded-md bg-background border border-border text-foreground font-medium"
                        >
                          {pre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Recommended Courses for this Step */}
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="text-2xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      <span>Khóa học đề xuất cho bước này</span>
                    </div>

                    {step.courses.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Chưa có khóa học gắn trực tiếp. Bạn có thể{' '}
                        <Link href="/app/student/browse" className="text-primary font-semibold hover:underline">
                          tìm thêm trong danh mục khóa học
                        </Link>
                        .
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {step.courses.map((course) => (
                          <div
                            key={`${step.id}-${course.course_id}`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/90 p-3 hover:border-primary/40 transition-all"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="text-xs font-bold text-foreground truncate">
                                  {course.title}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-3xs text-muted-foreground">
                                <span>{course.level_label}</span>
                                <span>·</span>
                                <span>{course.duration_hours} giờ</span>
                                <span>·</span>
                                <span className="font-semibold text-foreground">
                                  {course.is_external
                                    ? course.source_name
                                    : course.price === 0
                                      ? 'Miễn phí'
                                      : `${formatPrice(course.price)}đ`}
                                </span>
                              </div>
                            </div>

                            {course.is_external && course.external_url ? (
                              <a
                                href={course.external_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0"
                              >
                                <Button size="sm" variant="outline" icon={<ExternalLink className="h-3.5 w-3.5" />}>
                                  Nguồn
                                </Button>
                              </a>
                            ) : (
                              <Link href={`/app/student/courses/${course.course_id}`} className="shrink-0">
                                <Button size="sm" variant="outline" icon={<ArrowRight className="h-3.5 w-3.5" />}>
                                  Xem khóa
                                </Button>
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
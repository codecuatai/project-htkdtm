'use client'

/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Lock,
  PlayCircle,
  Search,
} from 'lucide-react'
import { enrollmentsApi, type Enrollment } from '../../services/api'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Input'
import { Progress } from '../../components/ui/Progress'
import { Skeleton } from '../../components/ui/Skeleton'

type CourseFilter = 'all' | 'not-started' | 'in-progress' | 'completed' | 'locked'
type CourseSort = 'recent' | 'progress-desc' | 'progress-asc' | 'title'

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'Không có ngày'
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

function getCourseTitle(enrollment: Enrollment) {
  return enrollment.course?.title || enrollment.course_title || 'Khóa học chưa đặt tên'
}

function getCourseDescription(enrollment: Enrollment) {
  return enrollment.course?.description || 'Tiếp tục lộ trình học tập với tài liệu bài giảng và bài tập thực hành.'
}

function getCourseProgress(enrollment: Enrollment) {
  return Math.round(enrollment.progress_percent || 0)
}

function isEnrollmentUnlocked(enrollment: Enrollment): boolean {
  const status = String(enrollment.status || '').toLowerCase()
  return status === 'active' || status === 'completed'
}

function getEnrollmentState(enrollment: Enrollment): Exclude<CourseFilter, 'all'> {
  if (!isEnrollmentUnlocked(enrollment)) return 'locked'
  if (enrollment.status === 'completed' || getCourseProgress(enrollment) >= 100) return 'completed'
  if (getCourseProgress(enrollment) === 0) return 'not-started'
  return 'in-progress'
}

export function MyCourses() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<CourseFilter>('all')
  const [sortBy, setSortBy] = useState<CourseSort>('recent')

  const loadEnrollments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await enrollmentsApi.list({ page_size: 100 })
      setEnrollments(res.data.items)
    } catch (err) {
      console.error('Failed to load enrollments:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEnrollments()
  }, [loadEnrollments])

  const counts = useMemo(() => {
    const notStarted = enrollments.filter((item) => getEnrollmentState(item) === 'not-started').length
    const inProgress = enrollments.filter((item) => getEnrollmentState(item) === 'in-progress').length
    const completed = enrollments.filter((item) => getEnrollmentState(item) === 'completed').length
    const locked = enrollments.filter((item) => getEnrollmentState(item) === 'locked').length
    const unlocked = enrollments.filter(isEnrollmentUnlocked)
    const avgProgress = unlocked.length
      ? Math.round(unlocked.reduce((sum, item) => sum + getCourseProgress(item), 0) / unlocked.length)
      : 0

    return {
      all: enrollments.length,
      notStarted,
      inProgress,
      completed,
      locked,
      avgProgress,
    }
  }, [enrollments])

  const continueEnrollment = useMemo(() => {
    return [...enrollments]
      .filter((item) => {
        const state = getEnrollmentState(item)
        return state === 'in-progress' || state === 'not-started'
      })
      .sort((a, b) => {
        const aProgress = getCourseProgress(a)
        const bProgress = getCourseProgress(b)
        if (aProgress === 0 && bProgress > 0) return 1
        if (bProgress === 0 && aProgress > 0) return -1
        return bProgress - aProgress
      })[0]
  }, [enrollments])

  const filteredEnrollments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const filtered = enrollments.filter((enrollment) => {
      const matchesTab = activeTab === 'all' || getEnrollmentState(enrollment) === activeTab
      const matchesQuery =
        !normalizedQuery ||
        [getCourseTitle(enrollment), getCourseDescription(enrollment), enrollment.lecturer_name].some(
          (value) => value?.toLowerCase().includes(normalizedQuery)
        )

      return matchesTab && matchesQuery
    })

    return filtered.sort((a, b) => {
      if (sortBy === 'progress-desc') return getCourseProgress(b) - getCourseProgress(a)
      if (sortBy === 'progress-asc') return getCourseProgress(a) - getCourseProgress(b)
      if (sortBy === 'title') return getCourseTitle(a).localeCompare(getCourseTitle(b))
      return new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime()
    })
  }, [activeTab, enrollments, query, sortBy])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Không gian học tập</p>
          <h1 className="mt-1 text-fluid-2xl font-bold text-foreground">Khóa Học Của Tôi</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Nội dung học chỉ mở sau khi hệ thống xác nhận ghi danh hợp lệ. Hoàn thành bài bắt buộc và đạt mốc Quiz cuối khóa{' '}
            <strong className="text-foreground">70/100</strong> để nhận huy hiệu hoàn thành.
          </p>
        </div>
        <Link href="/app/student/browse">
          <Button iconRight={<ArrowRight className="h-4 w-4" />} fullWidthMobile>
            Khám phá khóa học
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<BookOpen />} label="Đã ghi danh" value={counts.all} />
        <Metric icon={<PlayCircle />} label="Đang học" value={counts.inProgress} />
        <Metric icon={<CheckCircle2 />} label="Đã hoàn thành" value={counts.completed} />
        <Metric icon={<GraduationCap />} label="Tiến độ trung bình" value={`${counts.avgProgress}%`} />
      </div>

      {!loading && continueEnrollment && (
        <ContinueLearningHero enrollment={continueEnrollment} />
      )}

      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-border p-4">
          <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <FilterPills activeTab={activeTab} counts={counts} onChange={setActiveTab} />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                value={query}
                onChange={setQuery}
                placeholder="Tìm kiếm khóa học của bạn..."
                prefixIcon={<Search className="h-4 w-4" />}
                aria-label="Tìm kiếm khóa học đã ghi danh"
                className="sm:w-72"
              />
              <label className="sr-only" htmlFor="course-sort">
                Sắp xếp khóa học
              </label>
              <select
                id="course-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as CourseSort)}
                className="h-10 shrink-0 whitespace-nowrap rounded-md border border-input bg-surface-elevated px-3 text-sm text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="recent">Mới ghi danh gần đây</option>
                <option value="progress-desc">Tiến độ: Cao đến thấp</option>
                <option value="progress-asc">Tiến độ: Thấp đến cao</option>
                <option value="title">Tên khóa học</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 p-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} padding="responsive" variant="outlined">
                <div className="flex gap-4">
                  <Skeleton className="h-24 w-32 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <EmptyState
            icon={<BookOpen />}
            title={query ? 'Không tìm thấy khóa học phù hợp' : 'Chưa có khóa học nào'}
            description={
              query
                ? 'Thử tìm kiếm với từ khóa khác hoặc chuyển bộ lọc.'
                : activeTab === 'all'
                  ? 'Khám phá danh mục và ghi danh vào một khóa học để bắt đầu học tập.'
                  : 'Các khóa học thuộc trạng thái này sẽ xuất hiện tại đây.'
            }
            action={
              <Link href="/app/student/browse">
                <Button>Khám phá khóa học</Button>
              </Link>
            }
            className="m-4"
          />
        ) : (
          <div className="grid gap-4 p-4 lg:grid-cols-2">
            {filteredEnrollments.map((enrollment) => (
              <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <Card padding="responsive">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </div>
      </div>
      <p className="mt-2 text-2xl font-semibold text-foreground tabular-nums">{value}</p>
    </Card>
  )
}

function FilterPills({
  activeTab,
  counts,
  onChange,
}: {
  activeTab: CourseFilter
  counts: { all: number; notStarted: number; inProgress: number; completed: number; locked: number }
  onChange: (filter: CourseFilter) => void
}) {
  const filters: Array<{ id: CourseFilter; label: string; count: number }> = [
    { id: 'all', label: 'Tất cả', count: counts.all },
    { id: 'not-started', label: 'Chưa bắt đầu', count: counts.notStarted },
    { id: 'in-progress', label: 'Đang học', count: counts.inProgress },
    { id: 'completed', label: 'Đã hoàn thành', count: counts.completed },
    ...(counts.locked > 0 ? [{ id: 'locked' as const, label: 'Chờ thanh toán', count: counts.locked }] : []),
  ]

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex min-w-max items-center gap-1 rounded-xl border border-border bg-muted/35 p-1">
        {filters.map((filter) => {
          const active = activeTab === filter.id
          return (
            <button
              key={filter.id}
              onClick={() => onChange(filter.id)}
              className={[
                'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition',
                active
                  ? 'bg-surface-elevated text-foreground shadow-soft'
                  : 'text-muted-foreground hover:bg-surface-elevated/70 hover:text-foreground',
              ].join(' ')}
            >
              <span>{filter.label}</span>
              <span
                className={[
                  'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
                  active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                ].join(' ')}
              >
                {filter.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ContinueLearningHero({ enrollment }: { enrollment: Enrollment }) {
  const progress = getCourseProgress(enrollment)
  const title = getCourseTitle(enrollment)
  const thumbnail = enrollment.course?.thumbnail_url || enrollment.course_thumbnail

  return (
    <Card padding="responsive" className="overflow-hidden border-primary/20 bg-primary/5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="hidden h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 sm:flex sm:items-center sm:justify-center">
            {thumbnail ? (
              <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
            ) : (
              <PlayCircle className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Tiếp tục bài học</p>
            <h2 className="mt-1 line-clamp-2 text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tiếp tục bài học gần nhất để duy trì nhịp độ học tập của bạn.
            </p>
            <div className="mt-3 max-w-md">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tiến độ</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </div>
        </div>
        <Link href={`/app/student/courses/${enrollment.course_id}/learn`} className="shrink-0">
          <Button iconRight={<ArrowRight className="h-4 w-4" />} fullWidthMobile>
            {progress === 0 ? 'Bắt đầu học' : 'Tiếp tục'}
          </Button>
        </Link>
      </div>
    </Card>
  )
}

function EnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
  const progress = getCourseProgress(enrollment)
  const state = getEnrollmentState(enrollment)
  const unlocked = isEnrollmentUnlocked(enrollment)
  const title = getCourseTitle(enrollment)
  const thumbnail = enrollment.course?.thumbnail_url || enrollment.course_thumbnail

  return (
    <Card padding="responsive" interactive={unlocked} className="group">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href={`/app/student/courses/${enrollment.course_id}`}
          className="relative flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 sm:h-28 sm:w-40"
        >
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
            />
          ) : (
            <BookOpen className="h-9 w-9 text-primary" />
          )}
          {!unlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-[1px]">
              <Lock className="h-6 w-6 text-amber-600" />
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/app/student/courses/${enrollment.course_id}`}
                className="line-clamp-1 font-semibold text-foreground transition hover:text-primary"
              >
                {title}
              </Link>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {unlocked
                  ? getCourseDescription(enrollment)
                  : 'Khóa học đang bị khóa nội dung do chưa xác nhận thanh toán hợp lệ từ hệ thống.'}
              </p>
            </div>
            <Badge
              variant={
                state === 'completed'
                  ? 'success'
                  : state === 'in-progress'
                    ? 'primary'
                    : state === 'locked'
                      ? 'warning'
                      : 'default'
              }
              label={
                state === 'locked'
                  ? 'Chưa thanh toán'
                  : state === 'not-started'
                    ? 'Chưa bắt đầu'
                    : state === 'in-progress'
                      ? 'Đang học'
                      : 'Đã hoàn thành'
              }
              className="shrink-0"
            />
          </div>

          {unlocked ? (
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  {state === 'completed' && <Award className="h-3.5 w-3.5 text-emerald-500" />}
                  Tiến độ
                </span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>Nội dung bài học bị ẩn cho đến khi thanh toán được xác minh.</span>
            </div>
          )}

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Ghi danh ngày {formatDate(enrollment.enrolled_at)}
            </div>
            <div className="flex gap-2">
              <Link href={`/app/student/courses/${enrollment.course_id}`}>
                <Button variant="outline" size="sm">
                  Chi tiết
                </Button>
              </Link>
              {unlocked ? (
                <Link href={`/app/student/courses/${enrollment.course_id}/learn`}>
                  <Button size="sm">
                    {state === 'completed' ? 'Xem lại' : progress === 0 ? 'Bắt đầu' : 'Tiếp tục'}
                  </Button>
                </Link>
              ) : (
                <Link href="/app/student/cart">
                  <Button size="sm" variant="primary">
                    Thanh toán ngay
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
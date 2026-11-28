'use client'

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  Compass,
  Search,
  BookOpen,
  ArrowRight,
  Filter,
  ExternalLink,
  ShieldCheck,
  Clock,
  RotateCcw,
  Tag,
} from 'lucide-react'
import { coursesApi, categoriesApi, type Course, type Category } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { cn } from '../../utils/cn'
import { normalizeCourseMeta, type CourseKind, type CourseLevel } from './courseMeta'
import { trackRecommendationClick, trackRecommendationImpression } from '../../utils/eventTracker'

type PriceFilter = 'all' | 'free' | 'under_500k' | 'over_500k'
type DurationFilter = 'all' | 'short' | 'medium' | 'long'

export function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Filters synced with URL query params
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [courseType, setCourseType] = useState<'all' | CourseKind>('all')
  const [levelFilter, setLevelFilter] = useState<'all' | CourseLevel>('all')
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all')
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all')
  const [skillFilter, setSkillFilter] = useState('')
  const [initialized, setInitialized] = useState(false)

  // Read initial filters from URL query params
  useEffect(() => {
    if (typeof window === 'undefined') return
    const sp = new URLSearchParams(window.location.search)
    const q = sp.get('search') || ''
    const cat = sp.get('category_id')
    const type = sp.get('course_type')
    const lvl = sp.get('level')
    const price = sp.get('price')
    const dur = sp.get('duration')
    const skill = sp.get('skill') || ''

    if (q) setSearch(q)
    if (cat) setSelectedCategory(cat)
    if (type === 'internal' || type === 'external') setCourseType(type)
    if (lvl === 'beginner' || lvl === 'intermediate' || lvl === 'advanced') setLevelFilter(lvl)
    if (price === 'free' || price === 'under_500k' || price === 'over_500k') setPriceFilter(price)
    if (dur === 'short' || dur === 'medium' || dur === 'long') setDurationFilter(dur)
    if (skill) setSkillFilter(skill)
    setInitialized(true)
  }, [])

  // Sync filters back to URL query params
  useEffect(() => {
    if (!initialized || typeof window === 'undefined') return
    const sp = new URLSearchParams()
    if (search.trim()) sp.set('search', search.trim())
    if (selectedCategory) sp.set('category_id', selectedCategory)
    if (courseType !== 'all') sp.set('course_type', courseType)
    if (levelFilter !== 'all') sp.set('level', levelFilter)
    if (priceFilter !== 'all') sp.set('price', priceFilter)
    if (durationFilter !== 'all') sp.set('duration', durationFilter)
    if (skillFilter.trim()) sp.set('skill', skillFilter.trim())

    const qs = sp.toString()
    const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname
    window.history.replaceState(null, '', nextUrl)
  }, [initialized, search, selectedCategory, courseType, levelFilter, priceFilter, durationFilter, skillFilter])

  const loadCourses = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | undefined> = {
        status: 'published',
        page_size: 50,
      }
      if (selectedCategory) params.category_id = selectedCategory
      if (search.trim()) params.search = search.trim()
      if (courseType !== 'all') params.course_type = courseType
      if (levelFilter !== 'all') params.level = levelFilter
      const res = await coursesApi.list(params)
      setCourses(res.data.items || [])
    } catch (err) {
      console.error('Failed to load courses:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, search, courseType, levelFilter])

  const loadCategories = useCallback(async () => {
    try {
      const res = await categoriesApi.list()
      setCategories(res.data || [])
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  useEffect(() => {
    if (!initialized) return
    loadCourses()
  }, [initialized, loadCourses])

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const meta = normalizeCourseMeta(course)

      if (courseType !== 'all' && meta.kind !== courseType) return false
      if (levelFilter !== 'all' && meta.level !== levelFilter) return false

      if (priceFilter === 'free' && (meta.isExternal || course.price !== 0)) return false
      if (priceFilter === 'under_500k' && (meta.isExternal || course.price <= 0 || course.price > 500000)) return false
      if (priceFilter === 'over_500k' && (meta.isExternal || course.price <= 500000)) return false

      if (durationFilter === 'short' && meta.durationHours >= 5) return false
      if (durationFilter === 'medium' && (meta.durationHours < 5 || meta.durationHours > 15)) return false
      if (durationFilter === 'long' && meta.durationHours <= 15) return false

      if (skillFilter.trim()) {
        const kw = skillFilter.trim().toLowerCase()
        const haystack = [
          course.title,
          course.description || '',
          course.category?.name || '',
          ...meta.skills,
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(kw)) return false
      }

      return true
    })
  }, [courses, courseType, levelFilter, priceFilter, durationFilter, skillFilter])

  useEffect(() => {
    if (loading || filteredCourses.length === 0) return
    filteredCourses.slice(0, 8).forEach((course, idx) => {
      trackRecommendationImpression({
        courseId: course.id,
        runId: 'catalog_browse',
        rank: idx + 1,
        modelVersion: 'catalog_v1',
      })
    })
  }, [loading, filteredCourses])

  const hasActiveFilters = Boolean(
    selectedCategory ||
      search.trim() ||
      courseType !== 'all' ||
      levelFilter !== 'all' ||
      priceFilter !== 'all' ||
      durationFilter !== 'all' ||
      skillFilter.trim()
  )

  const handleResetFilters = () => {
    setSelectedCategory(null)
    setSearch('')
    setCourseType('all')
    setLevelFilter('all')
    setPriceFilter('all')
    setDurationFilter('all')
    setSkillFilter('')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadCourses()
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price)

  return (
    <div className="space-y-6 animate-fade-in font-body pb-12">
      {/* 1. Header & Search Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-surface-elevated via-primary/5 to-surface p-4 sm:p-6 md:p-8 shadow-soft">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Compass className="h-3.5 w-3.5" />
            <span>Danh mục khóa học SmartEdu</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Khám phá khóa học nội bộ & tài nguyên tham khảo
          </h1>

          <p className="text-sm md:text-base text-muted-foreground">
            Phân tách rõ khóa nội bộ SmartEdu đã kiểm duyệt và khóa tham khảo từ nguồn ngoài, hỗ trợ lọc nhanh theo kỹ năng, cấp độ và thời lượng.
          </p>

          <form onSubmit={handleSearch} className="pt-2">
            <div className="relative flex items-center max-w-xl">
              <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên khóa học, giảng viên, chủ đề..."
                className="w-full h-11 pl-10 pr-24 rounded-2xl border border-border bg-background text-sm placeholder:text-muted-foreground/70 focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 shadow-xs"
              />
              <button
                type="submit"
                className="absolute right-1.5 h-8 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1 hover:bg-primary/90 transition-all"
              >
                <span>Tìm kiếm</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 2. Advanced Filters Bar */}
      <div className="rounded-2xl border border-border/80 bg-surface-elevated p-4 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Bộ lọc khóa học</span>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Xóa tất cả bộ lọc</span>
            </button>
          )}
        </div>

        {/* Course Type Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Tất cả loại khóa' },
            { id: 'internal', label: 'Khóa nội bộ SmartEdu' },
            { id: 'external', label: 'Tham khảo ngoài (External)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCourseType(tab.id as 'all' | CourseKind)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border',
                courseType === tab.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground hover:border-primary/40'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="Lọc theo kỹ năng (SQL, React...)"
              className="w-full h-9 pl-8 pr-3 rounded-xl border border-input bg-background text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as 'all' | CourseLevel)}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">Cấp độ: Tất cả</option>
            <option value="beginner">Cấp độ: Cơ bản</option>
            <option value="intermediate">Cấp độ: Trung cấp</option>
            <option value="advanced">Cấp độ: Nâng cao</option>
          </select>

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">Khoảng giá: Tất cả</option>
            <option value="free">Miễn phí (0đ)</option>
            <option value="under_500k">Dưới 500.000đ</option>
            <option value="over_500k">Trên 500.000đ</option>
          </select>

          <select
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value as DurationFilter)}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">Thời lượng: Tất cả</option>
            <option value="short">Ngắn (&lt; 5 giờ)</option>
            <option value="medium">Trung bình (5 - 15 giờ)</option>
            <option value="long">Chuyên sâu (&gt; 15 giờ)</option>
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl whitespace-nowrap text-xs font-semibold transition-all duration-200',
              !selectedCategory
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40'
            )}
          >
            Tất cả danh mục
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl whitespace-nowrap text-xs font-semibold transition-all duration-200 flex items-center gap-1.5',
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40'
              )}
            >
              {cat.icon && <span>{cat.icon}</span>}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/70 bg-surface-elevated overflow-hidden p-4 space-y-3">
              <Skeleton className="h-44 w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-3.5 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border/80 bg-surface-elevated/40 p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <BookOpen className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">Không tìm thấy khóa học phù hợp</h3>
            <p className="text-xs text-muted-foreground">
              Không có khóa học nào khớp với bộ lọc hiện tại. Thử điều chỉnh hoặc xóa bộ lọc để xem toàn bộ danh mục.
            </p>
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleResetFilters} className="rounded-xl">
              Xóa bộ lọc
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course, idx) => {
            const meta = normalizeCourseMeta(course)
            const handleCourseClick = () => {
              trackRecommendationClick({
                courseId: course.id,
                runId: 'catalog_browse',
                rank: idx + 1,
                modelVersion: 'catalog_v1',
              })
            }

            return (
              <div
                key={course.id}
                className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-surface-elevated overflow-hidden hover:border-primary/40 hover:shadow-soft hover:-translate-y-1 transition-all duration-200"
              >
                <Link
                  href={`/app/student/courses/${course.id}`}
                  onClick={handleCourseClick}
                  className="block"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-rose-500/10 overflow-hidden">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BookOpen className="h-10 w-10 text-primary/40" />
                      </div>
                    )}

                    {/* Course Type Badge */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
                      {meta.isExternal ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/95 text-white text-3xs font-bold shadow-2xs">
                          <ExternalLink className="h-2.5 w-2.5" />
                          Tham khảo ngoài
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600/95 text-white text-3xs font-bold shadow-2xs">
                          <ShieldCheck className="h-2.5 w-2.5" />
                          Khóa nội bộ SmartEdu
                        </span>
                      )}
                    </div>

                    {/* Price or Source Badge */}
                    <div className="absolute bottom-2.5 right-2.5">
                      {meta.isExternal ? (
                        <span className="px-2 py-0.5 rounded-md text-3xs font-bold shadow-2xs bg-background/90 text-foreground border border-border/50">
                          {meta.sourceName}
                        </span>
                      ) : meta.isApprovedInternal ? (
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md text-3xs font-bold shadow-2xs backdrop-blur-xs',
                            course.price === 0 ? 'bg-emerald-500/90 text-white' : 'bg-primary/90 text-white'
                          )}
                        >
                          {course.price === 0 ? 'Miễn phí' : `${formatPrice(course.price)}đ`}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-3xs font-bold bg-muted text-muted-foreground">
                          Chờ duyệt
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-3xs text-muted-foreground font-medium">
                      <span className="px-1.5 py-0.5 rounded bg-muted">{meta.levelLabel}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meta.durationHours} giờ
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {course.title}
                    </h3>

                    {course.description && (
                      <p className="text-2xs text-muted-foreground line-clamp-2">{course.description}</p>
                    )}
                  </div>
                </Link>

                {/* Card Footer */}
                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2 text-2xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 truncate">
                      <div className="h-5 w-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-3xs font-bold shrink-0">
                        {course.lecturer?.full_name?.[0] || 'G'}
                      </div>
                      <span className="truncate">
                        {meta.isExternal ? meta.sourceName : course.lecturer?.full_name || 'Giảng viên'}
                      </span>
                    </div>

                    {meta.isExternal && meta.externalUrl ? (
                      <a
                        href={meta.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleCourseClick}
                        className="inline-flex items-center gap-1 shrink-0 text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                      >
                        <span>Xem nguồn</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Link
                        href={`/app/student/courses/${course.id}`}
                        onClick={handleCourseClick}
                        className="inline-flex items-center gap-1 shrink-0 text-primary font-semibold hover:underline"
                      >
                        <span>Chi tiết</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
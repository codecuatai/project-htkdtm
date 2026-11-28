import type { Course } from '../../services/api'

export type CourseKind = 'internal' | 'external'
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'

export type ExtendedCourse = Course & {
  course_type?: string
  source_type?: string
  external_url?: string
  source_url?: string
  source_name?: string
  provider?: string
  duration_hours?: number
  skills?: string[]
}

export interface NormalizedCourseMeta {
  kind: CourseKind
  isExternal: boolean
  isApprovedInternal: boolean
  sourceName: string
  externalUrl: string | null
  level: CourseLevel
  levelLabel: string
  durationHours: number
  skills: string[]
}

export const LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
}

export function normalizeCourseMeta(rawCourse: Course): NormalizedCourseMeta {
  const course = rawCourse as ExtendedCourse
  const rawType = (course.course_type || course.source_type || '').toLowerCase()
  const externalUrl = course.external_url || course.source_url || null
  const isExternal = rawType === 'external' || rawType === 'reference' || Boolean(externalUrl)

  const rawLevel = (course.level || '').toLowerCase()
  let level: CourseLevel = 'beginner'
  if (rawLevel.includes('adv') || rawLevel.includes('nâng cao')) {
    level = 'advanced'
  } else if (rawLevel.includes('inter') || rawLevel.includes('trung')) {
    level = 'intermediate'
  }

  const durationHours =
    typeof course.duration_hours === 'number' && course.duration_hours > 0
      ? course.duration_hours
      : Math.max(2, Math.round((course.lesson_count || course.materials?.length || 4) * 0.5))

  const parsedTags =
    typeof course.tags === 'string'
      ? course.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : []

  const skills =
    Array.isArray(course.skills) && course.skills.length > 0
      ? course.skills
      : parsedTags.length > 0
        ? parsedTags
        : course.category?.name
          ? [course.category.name]
          : []

  return {
    kind: isExternal ? 'external' : 'internal',
    isExternal,
    isApprovedInternal: !isExternal && course.status === 'published',
    sourceName: course.source_name || course.provider || 'Nguồn tham khảo ngoài',
    externalUrl,
    level,
    levelLabel: LEVEL_LABELS[level],
    durationHours,
    skills,
  }
}
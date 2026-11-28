import { useEffect } from 'react'
import api from '../services/api'

export type TrackingEventType =
  | 'course_view'
  | 'recommendation_impression'
  | 'recommendation_click'
  | 'learning_heartbeat'

export interface TrackingEventPayload {
  event_type: TrackingEventType
  course_id: string
  lesson_id?: string | null
  run_id?: string | null
  rank?: number | null
  model_version?: string | null
  duration_seconds?: number | null
  metadata?: Record<string, unknown>
}

// Bộ nhớ tạm chống spam request giống nhau trong khoảng debounceMs
const recentEventTimestamps = new Map<string, number>()

function getDebounceKey(payload: TrackingEventPayload): string {
  return [
    payload.event_type,
    payload.course_id,
    payload.lesson_id || '',
    payload.run_id || '',
    payload.rank ?? '',
  ].join(':')
}

export async function trackEvent(
  payload: TrackingEventPayload,
  debounceMs = 2000
): Promise<void> {
  if (!payload.course_id) return

  const key = getDebounceKey(payload)
  const now = Date.now()
  const lastSent = recentEventTimestamps.get(key)

  if (lastSent && now - lastSent < debounceMs) {
    return
  }
  recentEventTimestamps.set(key, now)

  try {
    await api.post('/api/v1/events/track', {
      ...payload,
      occurred_at: new Date().toISOString(),
    })
  } catch {
    // Im lặng bỏ qua nếu backend chưa bật endpoint, không làm gián đoạn UX người học
  }
}

export function trackCourseView(courseId: string) {
  return trackEvent(
    {
      event_type: 'course_view',
      course_id: courseId,
    },
    5000
  )
}

export function trackRecommendationImpression(params: {
  courseId: string
  runId?: string | null
  rank?: number | null
  modelVersion?: string | null
}) {
  return trackEvent(
    {
      event_type: 'recommendation_impression',
      course_id: params.courseId,
      run_id: params.runId ?? null,
      rank: params.rank ?? null,
      model_version: params.modelVersion ?? null,
    },
    10000
  )
}

export function trackRecommendationClick(params: {
  courseId: string
  runId?: string | null
  rank?: number | null
  modelVersion?: string | null
}) {
  return trackEvent(
    {
      event_type: 'recommendation_click',
      course_id: params.courseId,
      run_id: params.runId ?? null,
      rank: params.rank ?? null,
      model_version: params.modelVersion ?? null,
    },
    1500
  )
}

/**
 * Gửi heartbeat thời lượng học hợp lệ mỗi intervalSeconds (mặc định 30s)
 * Chỉ tính thời gian khi tab trình duyệt đang hiển thị (document.visibilityState === 'visible').
 */
export function useLearningHeartbeat(
  courseId: string | undefined,
  lessonId: string | undefined,
  enabled = true,
  intervalSeconds = 30
) {
  
  

  useEffect(() => {
    if (!courseId || !enabled) return

    const timer = setInterval(() => {
      
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return
      }

      trackEvent(
        {
          event_type: 'learning_heartbeat',
          course_id: courseId,
          lesson_id: lessonId ?? null,
          duration_seconds: intervalSeconds,
        },
        Math.max(5000, (intervalSeconds - 5) * 1000)
      )
    }, intervalSeconds * 1000)

    return () => clearInterval(timer)
  }, [courseId, lessonId, enabled, intervalSeconds])
}
import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from '../../services/api'
import {
  trackCourseView,
  trackRecommendationClick,
  trackRecommendationImpression,
} from '../eventTracker'

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { ok: true } }),
  },
}))

describe('eventTracker (Module 10 BI Tracking)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('tracks course_view and debounces duplicate rapid calls', async () => {
    await trackCourseView('course-bi-1')
    await trackCourseView('course-bi-1')

    expect(api.post).toHaveBeenCalledTimes(1)
    expect(api.post).toHaveBeenCalledWith(
      '/api/v1/events/track',
      expect.objectContaining({
        event_type: 'course_view',
        course_id: 'course-bi-1',
      })
    )
  })

  it('tracks recommendation_impression with run_id, rank, and model_version', async () => {
    await trackRecommendationImpression({
      courseId: 'course-rec-1',
      runId: 'run-123',
      rank: 1,
      modelVersion: 'catalog_v1',
    })

    expect(api.post).toHaveBeenCalledWith(
      '/api/v1/events/track',
      expect.objectContaining({
        event_type: 'recommendation_impression',
        course_id: 'course-rec-1',
        run_id: 'run-123',
        rank: 1,
        model_version: 'catalog_v1',
      })
    )
  })

  it('tracks recommendation_click with run_id and rank', async () => {
    await trackRecommendationClick({
      courseId: 'course-rec-2',
      runId: 'run-456',
      rank: 2,
      modelVersion: 'catalog_v1',
    })

    expect(api.post).toHaveBeenCalledWith(
      '/api/v1/events/track',
      expect.objectContaining({
        event_type: 'recommendation_click',
        course_id: 'course-rec-2',
        run_id: 'run-456',
        rank: 2,
      })
    )
  })
})
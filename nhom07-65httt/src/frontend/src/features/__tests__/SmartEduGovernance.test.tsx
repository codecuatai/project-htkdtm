import { describe, it, expect, beforeEach } from 'vitest'
import {
  readCourseSmartEduMeta,
  saveCourseSmartEduMeta,
} from '../lecturer/EditCourseDetailsModal'

describe('SmartEdu Lecturer Metadata (Module 8)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and reads SmartEdu course metadata accurately', () => {
    saveCourseSmartEduMeta('course-meta-1', {
      input_skills: ['Python'],
      output_skills: ['Phân tích dữ liệu (BI)', 'SQL & Cơ sở dữ liệu'],
      prerequisites: 'Biết lập trình cơ bản',
      estimated_hours: 18,
      level: 'intermediate',
    })

    const loaded = readCourseSmartEduMeta('course-meta-1')
    expect(loaded).not.toBeNull()
    expect(loaded?.estimated_hours).toBe(18)
    expect(loaded?.level).toBe('intermediate')
    expect(loaded?.output_skills).toContain('Phân tích dữ liệu (BI)')
  })

  it('returns null when course metadata does not exist', () => {
    expect(readCourseSmartEduMeta('non-existent-id')).toBeNull()
  })
})
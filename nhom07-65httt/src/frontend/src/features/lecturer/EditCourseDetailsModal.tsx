/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Textarea } from '../../components/ui/Textarea'
import { coursesApi, type Course } from '../../services/api'
import { useAppStore } from '../../stores/appStore'
import { cn } from '../../utils/cn'

export interface SmartEduCourseMetadata {
  input_skills: string[]
  output_skills: string[]
  prerequisites: string
  estimated_hours: number
  level: string
}

const SKILL_TAXONOMY = [
  'Tư duy lập trình',
  'Python',
  'JavaScript / TypeScript',
  'React / Next.js',
  'SQL & Cơ sở dữ liệu',
  'Phân tích dữ liệu (BI)',
  'Machine Learning / AI',
  'Thiết kế hệ thống & API',
  'Cloud & DevOps',
  'An toàn thông tin',
]

const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Cơ bản (Beginner)' },
  { value: 'intermediate', label: 'Trung cấp (Intermediate)' },
  { value: 'advanced', label: 'Nâng cao (Advanced)' },
]

export function readCourseSmartEduMeta(courseId: string): SmartEduCourseMetadata | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`smartedu_course_meta_${courseId}`)
    if (!raw) return null
    return JSON.parse(raw) as SmartEduCourseMetadata
  } catch {
    return null
  }
}

export function saveCourseSmartEduMeta(courseId: string, meta: SmartEduCourseMetadata): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`smartedu_course_meta_${courseId}`, JSON.stringify(meta))
}

interface EditCourseDetailsModalProps {
  course: Course
  open: boolean
  onClose: () => void
  onSaved: (course: Course) => void
}

export function EditCourseDetailsModal({ course, open, onClose, onSaved }: EditCourseDetailsModalProps) {
  const toasts = useAppStore((state) => state.toasts)
  const [title, setTitle] = useState(course.title)
  const [description, setDescription] = useState(course.description)
  const [price, setPrice] = useState(String(course.price ?? 0))
  const [level, setLevel] = useState(course.level || 'beginner')
  const [language, setLanguage] = useState(course.language || 'Tiếng Việt')
  const [estimatedHours, setEstimatedHours] = useState('12')
  const [inputSkills, setInputSkills] = useState<string[]>([])
  const [outputSkills, setOutputSkills] = useState<string[]>([])
  const [requirements, setRequirements] = useState(course.requirements || '')
  const [learningOutcomes, setLearningOutcomes] = useState(course.learning_outcomes || '')
  const [tags, setTags] = useState(course.tags || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    const savedMeta = readCourseSmartEduMeta(course.id)
    setTitle(course.title)
    setDescription(course.description)
    setPrice(String(course.price ?? 0))
    setLevel(savedMeta?.level || course.level || 'beginner')
    setLanguage(course.language || 'Tiếng Việt')
    setEstimatedHours(String(savedMeta?.estimated_hours ?? 12))
    setInputSkills(savedMeta?.input_skills || [])
    setOutputSkills(savedMeta?.output_skills || [])
    setRequirements(savedMeta?.prerequisites || course.requirements || '')
    setLearningOutcomes(course.learning_outcomes || '')
    setTags(course.tags || '')
  }, [course, open])

  const toggleSkill = (list: string[], setList: (next: string[]) => void, skill: string) => {
    if (list.includes(skill)) {
      setList(list.filter((s) => s !== skill))
    } else {
      setList([...list, skill])
    }
  }

  const save = async () => {
    if (!title.trim()) {
      toasts.add({ type: 'error', title: 'Vui lòng nhập tên khóa học' })
      return
    }

    const parsedPrice = Number(price)
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toasts.add({ type: 'error', title: 'Giá học phí không hợp lệ' })
      return
    }

    const parsedHours = Number(estimatedHours)
    if (Number.isNaN(parsedHours) || parsedHours <= 0) {
      toasts.add({ type: 'error', title: 'Thời lượng ước tính phải lớn hơn 0 giờ' })
      return
    }

    if (outputSkills.length === 0) {
      toasts.add({ type: 'error', title: 'Vui lòng chọn ít nhất 1 kỹ năng đầu ra theo taxonomy' })
      return
    }

    const mergedTags = Array.from(
      new Set([
        ...tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        ...outputSkills,
      ])
    ).join(', ')

    saveCourseSmartEduMeta(course.id, {
      input_skills: inputSkills,
      output_skills: outputSkills,
      prerequisites: requirements.trim(),
      estimated_hours: parsedHours,
      level,
    })

    setSaving(true)
    try {
      const res = await coursesApi.update(course.id, {
        title: title.trim(),
        description: description.trim(),
        price: parsedPrice,
        level: level.trim(),
        language: language.trim(),
        requirements: requirements.trim() || null,
        learning_outcomes: learningOutcomes.trim() || null,
        tags: mergedTags || null,
      })
      onSaved(res.data)
      toasts.add({ type: 'success', title: 'Cập nhật thông tin & metadata SmartEdu thành công' })
      onClose()
    } catch {
      toasts.add({ type: 'error', title: 'Không thể cập nhật khóa học lên máy chủ' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chỉnh sửa khóa học nội bộ (Chuẩn Metadata SmartEdu)"
      description="Điền đầy đủ kỹ năng đầu vào/đầu ra theo taxonomy, điều kiện tiên quyết, cấp độ và thời lượng trước khi gửi Admin duyệt mở bán."
      size="3xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={save} loading={saving}>
            Lưu metadata khóa học
          </Button>
        </>
      }
    >
      <div className="grid gap-5 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-foreground">Tên khóa học *</label>
            <Input value={title} onChange={setTitle} className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Giá học phí (VNĐ)</label>
            <Input type="number" value={price} onChange={setPrice} className="mt-2" min={0} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Cấp độ (Level) *</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-input bg-surface-elevated px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Thời lượng ước tính (giờ) *</label>
            <Input
              type="number"
              value={estimatedHours}
              onChange={setEstimatedHours}
              className="mt-2"
              min={1}
              placeholder="VD: 16"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Ngôn ngữ</label>
            <Input value={language} onChange={setLanguage} className="mt-2" placeholder="Tiếng Việt, Tiếng Anh..." />
          </div>
        </div>

        {/* Input Skills Taxonomy */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Kỹ năng đầu vào (Taxonomy) — Học viên nên biết trước
          </label>
          <div className="flex flex-wrap gap-2">
            {SKILL_TAXONOMY.map((skill) => {
              const selected = inputSkills.includes(skill)
              return (
                <button
                  key={`in-${skill}`}
                  type="button"
                  onClick={() => toggleSkill(inputSkills, setInputSkills, skill)}
                  className={cn(
                    'rounded-lg border px-2.5 py-1 text-xs font-medium transition-all',
                    selected
                      ? 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  )}
                >
                  {selected ? '✓ ' : '+ '}
                  {skill}
                </button>
              )
            })}
          </div>
        </div>

        {/* Output Skills Taxonomy */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Kỹ năng đầu ra (Taxonomy) * — Bắt buộc để AI gợi ý & dựng Roadmap
          </label>
          <div className="flex flex-wrap gap-2">
            {SKILL_TAXONOMY.map((skill) => {
              const selected = outputSkills.includes(skill)
              return (
                <button
                  key={`out-${skill}`}
                  type="button"
                  onClick={() => toggleSkill(outputSkills, setOutputSkills, skill)}
                  className={cn(
                    'rounded-lg border px-2.5 py-1 text-xs font-medium transition-all',
                    selected
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  )}
                >
                  {selected ? '✓ ' : '+ '}
                  {skill}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Điều kiện tiên quyết (Prerequisites)</label>
          <Textarea
            value={requirements}
            onChange={(event) => setRequirements(event.target.value)}
            className="mt-2"
            placeholder="VD: Đã hoàn thành lập trình cơ bản hoặc biết sử dụng SQL..."
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Mô tả khóa học</label>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-2 min-h-24"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Mục tiêu đầu ra chi tiết</label>
          <Textarea
            value={learningOutcomes}
            onChange={(event) => setLearningOutcomes(event.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Thẻ phân loại bổ sung (Tags)</label>
          <Input value={tags} onChange={setTags} className="mt-2" placeholder="Cách nhau bằng dấu phẩy" />
        </div>
      </div>
    </Modal>
  )
}
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Clock,
  DollarSign,
  Edit,
  Layers,
  Megaphone,
  Send,
  Star,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import api, { coursesApi } from '../../services/api'
import type { Course } from '../../services/api'
import { useAppStore } from '../../stores/appStore'
import { CourseContentManager } from './CourseContentManager'
import { ReviewsManager } from './ReviewsManager'
import { CourseChatPanel } from '../courses/CourseChatPanel'
import { CourseGradingWorkspace } from './CourseGradingWorkspace'
import {
  EditCourseDetailsModal,
  readCourseSmartEduMeta,
  type SmartEduCourseMetadata,
} from './EditCourseDetailsModal'
import { CourseStudentsWorkspace } from './CourseStudentsWorkspace'
import { LecturerTeachingOps } from './LecturerTeachingOps'

type Tab = 'content' | 'teaching' | 'chat' | 'grading' | 'reviews' | 'students' | 'analytics'

interface CourseAnalytics {
  total_students: number
  enrollment_count: number
  revenue: number
  rating_avg: number
  rating_count: number
}

interface ApprovalState {
  status: 'draft' | 'pending_review' | 'rejected' | 'published'
  rejection_reason?: string
  submitted_at?: string
}

function readApprovalState(courseId: string, courseStatus: string): ApprovalState {
  if (courseStatus === 'published') return { status: 'published' }
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`smartedu_course_approval_${courseId}`)
      if (raw) return JSON.parse(raw) as ApprovalState
    } catch {
      // ignore invalid JSON
    }
  }
  if (courseStatus === 'pending_review' || courseStatus === 'rejected') {
    return { status: courseStatus }
  }
  return { status: 'draft' }
}

export function LecturerCourseDetail() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()
  const toasts = useAppStore((state) => state.toasts)
  const [course, setCourse] = useState<Course | null>(null)
  const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null)
  const [smartMeta, setSmartMeta] = useState<SmartEduCourseMetadata | null>(null)
  const [approval, setApproval] = useState<ApprovalState>({ status: 'draft' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingDetails, setEditingDetails] = useState(false)

  const [activeTab, setActiveTab] = useState<Tab>('content')

  useEffect(() => {
    if (id) {
      Promise.all([
        coursesApi.get(id),
        coursesApi.getStats().catch(() => null),
      ])
        .then(([courseRes, statsRes]) => {
          setCourse(courseRes.data)
          setSmartMeta(readCourseSmartEduMeta(id))
          const rawCourse = courseRes.data as Course & { rejection_reason?: string }
          const localApproval = readApprovalState(id, courseRes.data.status)
          if (rawCourse.rejection_reason) {
            setApproval({ status: 'rejected', rejection_reason: rawCourse.rejection_reason })
          } else {
            setApproval(localApproval)
          }

          const stats = statsRes?.data?.course_stats?.find((c: { course_id: string }) => c.course_id === id)
          if (stats) {
            setAnalytics({
              total_students: stats.enrollment_count,
              enrollment_count: stats.enrollment_count,
              revenue: stats.revenue,
              rating_avg: stats.rating_avg,
              rating_count: 0,
            })
          }
          setLoading(false)
        })
        .catch(() => {
          router.push('/app/lecturer/courses')
        })
    }
  }, [id, router])

  const handleSubmitForApproval = async () => {
    if (!course) return
    setSubmittingReview(true)
    const nextState: ApprovalState = {
      status: 'pending_review',
      submitted_at: new Date().toISOString(),
    }

    try {
      await api.post(`/api/v1/courses/${course.id}/submit-review`, {
        metadata: smartMeta,
      })
    } catch {
      // Fallback to local workflow state if backend submit-review route is not enabled yet
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`smartedu_course_approval_${course.id}`, JSON.stringify(nextState))
      }
      setApproval(nextState)
      toasts.add({
        type: 'success',
        title: 'Đã gửi Admin duyệt mở bán',
        
      })
      setSubmittingReview(false)
    }
  }

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    )
  }

  const getStatusBadge = () => {
    if (approval.status === 'published' || course.status === 'published') {
      return <Badge variant="success" label="Đã duyệt mở bán" />
    }
    if (approval.status === 'pending_review') {
      return <Badge variant="primary" label="Chờ Admin duyệt" />
    }
    if (approval.status === 'rejected') {
      return <Badge variant="error" label="Bị từ chối duyệt" />
    }
    if (course.status === 'archived') {
      return <Badge variant="default" label="Đã lưu trữ" />
    }
    return <Badge variant="warning" label="Bản nháp" />
  }

  const tabs = [
    { id: 'content' as Tab, label: 'Nội dung' },
    { id: 'teaching' as Tab, label: 'Vận hành giảng dạy' },
    { id: 'chat' as Tab, label: 'Trao đổi thảo luận' },
    { id: 'grading' as Tab, label: 'Chấm bài' },
    { id: 'reviews' as Tab, label: 'Đánh giá & Nhận xét' },
    { id: 'students' as Tab, label: 'Học viên' },
    { id: 'analytics' as Tab, label: 'Thống kê' },
  ]

  const canSubmitForReview = approval.status === 'draft' || approval.status === 'rejected'

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/app/lecturer/courses')}
            className="text-sm text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách khóa học
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-fluid-2xl font-bold text-foreground">{course.title}</h1>
            {getStatusBadge()}
          </div>
          <p className="text-muted-foreground mt-1">{course.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            icon={<Edit className="h-4 w-4" />}
            onClick={() => setEditingDetails(true)}
            fullWidthMobile
          >
            Sửa metadata
          </Button>
          {canSubmitForReview && (
            <Button
              variant="primary"
              icon={<Send className="h-4 w-4" />}
              loading={submittingReview}
              onClick={handleSubmitForApproval}
              fullWidthMobile
            >
              Gửi Admin duyệt mở bán
            </Button>
          )}
        </div>
      </div>

      {/* Rejection Reason Banner */}
      {approval.status === 'rejected' && (
        <div className="rounded-2xl border border-destructive/35 bg-destructive/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-destructive">Khóa học bị từ chối kiểm duyệt</p>
              <p className="text-foreground">
                Lý do: {approval.rejection_reason || 'Chưa đạt yêu cầu metadata hoặc nội dung bài giảng. Vui lòng chỉnh sửa và gửi duyệt lại.'}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setEditingDetails(true)}>
            Chỉnh sửa & Gửi lại
          </Button>
        </div>
      )}

      {/* SmartEdu Metadata Quick Summary */}
      <Card padding="responsive" className="bg-muted/25 border-border/70">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Layers className="h-4 w-4 text-primary" />
              Cấp độ: <strong className="text-foreground capitalize">{smartMeta?.level || course.level || 'Chưa chọn'}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Thời lượng: <strong className="text-foreground">{smartMeta?.estimated_hours ?? 12} giờ</strong>
            </span>
            <span className="text-muted-foreground">
              Kỹ năng đầu ra:{' '}
              <strong className="text-foreground">
                {smartMeta?.output_skills?.length ? smartMeta.output_skills.join(', ') : course.tags || 'Chưa gắn taxonomy'}
              </strong>
            </span>
          </div>
          {smartMeta?.prerequisites && (
            <span className="text-muted-foreground">
              Tiên quyết: <strong className="text-foreground">{smartMeta.prerequisites}</strong>
            </span>
          )}
        </div>
      </Card>

      <div className="border-b border-border overflow-x-auto">
        <nav className="flex gap-4 min-w-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-1 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'content' && <CourseContentManager course={course} />}
        {activeTab === 'teaching' && <LecturerTeachingOps courseId={course.id} courseTitle={course.title} />}
        {activeTab === 'chat' && <CourseChatPanel courseId={course.id} />}
        {activeTab === 'grading' && <CourseGradingWorkspace courseId={course.id} />}
        {activeTab === 'reviews' && <ReviewsManager courseId={course.id} />}
        {activeTab === 'students' && <CourseStudentsWorkspace courseId={course.id} />}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              Thống Kê Khóa Học
            </h2>
            <Card padding="responsive" className="border-accent/20 bg-accent/5">
              <div className="flex items-start gap-3">
                <Megaphone className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <p className="font-medium text-foreground">Các công cụ hỗ trợ và phân tích hiện được tích hợp tại mục Vận hành giảng dạy.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sử dụng để đăng thông báo, hỏi đáp bài học, soạn giáo án AI, xuất dữ liệu và phân tích các câu hỏi trắc nghiệm học viên hay làm sai.
                  </p>
                </div>
              </div>
            </Card>
            {analytics ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card padding="responsive" className="text-center">
                  <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-3xl font-bold text-foreground tabular-nums">{analytics.enrollment_count}</p>
                  <p className="text-xs text-muted-foreground mt-1">Tổng lượt ghi danh</p>
                </Card>
                <Card padding="responsive" className="text-center">
                  <Star className="h-8 w-8 text-warning mx-auto mb-3" />
                  <p className="text-3xl font-bold text-foreground tabular-nums">
                    {analytics.rating_avg > 0 ? analytics.rating_avg.toFixed(1) : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Đánh giá trung bình</p>
                </Card>
                <Card padding="responsive" className="text-center">
                  <DollarSign className="h-8 w-8 text-success mx-auto mb-3" />
                  <p className="text-3xl font-bold text-foreground tabular-nums">
                    {course.price === 0 ? '0 đ' : `${new Intl.NumberFormat('vi-VN').format(analytics.revenue)} đ`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Tổng doanh thu</p>
                </Card>
                <Card padding="responsive">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Thông Tin Khóa Học</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Học phí</span>
                      <span className="font-medium text-foreground">
                        {course.price === 0 ? 'Miễn phí' : `${new Intl.NumberFormat('vi-VN').format(course.price)} đ`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Danh mục</span>
                      <span className="font-medium text-foreground">{course.category_id || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trình độ</span>
                      <span className="font-medium text-foreground capitalize">{course.level || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngôn ngữ</span>
                      <span className="font-medium text-foreground">{course.language || '—'}</span>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Chưa có dữ liệu thống kê</h3>
                <p className="text-muted-foreground">Thống kê khóa học sẽ hiển thị khi có học viên đăng ký tham gia khóa học này.</p>
              </Card>
            )}
          </div>
        )}
      </div>
      <EditCourseDetailsModal
        course={course}
        open={editingDetails}
        onClose={() => setEditingDetails(false)}
        onSaved={(updated) => {
          setCourse(updated)
          setSmartMeta(readCourseSmartEduMeta(updated.id))
        }}
      />
    </div>
  )
}
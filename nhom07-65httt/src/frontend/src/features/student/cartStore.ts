import type { Course } from '../../services/api'
import { normalizeCourseMeta } from '../courses/courseMeta'

export interface CartItem {
  course_id: string
  title: string
  thumbnail_url?: string | null
  lecturer_name: string
  locked_unit_price: number
  added_at: string
}

const CART_STORAGE_KEY = 'smartedu_internal_cart_v1'

export function getCartItems(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CartItem[]) : []
  } catch {
    return []
  }
}

export function saveCartItems(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export function addCourseToCart(course: Course): { ok: boolean; message: string } {
  const meta = normalizeCourseMeta(course)
  if (meta.isExternal) {
    return {
      ok: false,
      message: 'Không thể thêm khóa tham khảo ngoài vào giỏ hàng SmartEdu.',
    }
  }
  if (!meta.isApprovedInternal) {
    return {
      ok: false,
      message: 'Khóa học nội bộ này chưa được duyệt mở bán.',
    }
  }

  const current = getCartItems()
  if (current.some((item) => item.course_id === course.id)) {
    return { ok: true, message: 'Khóa học đã có trong giỏ hàng.' }
  }

  const nextItem: CartItem = {
    course_id: course.id,
    title: course.title,
    thumbnail_url: course.thumbnail_url,
    lecturer_name: course.lecturer?.full_name || 'Giảng viên SmartEdu',
    locked_unit_price: course.price,
    added_at: new Date().toISOString(),
  }

  saveCartItems([...current, nextItem])
  return { ok: true, message: 'Đã thêm khóa học vào giỏ hàng.' }
}

export function removeCourseFromCart(courseId: string): CartItem[] {
  const next = getCartItems().filter((item) => item.course_id !== courseId)
  saveCartItems(next)
  return next
}

export function clearCart(): void {
  saveCartItems([])
}
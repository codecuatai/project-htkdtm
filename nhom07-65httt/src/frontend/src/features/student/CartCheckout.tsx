'use client'

/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CreditCard,
  Lock,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Trash2,
} from 'lucide-react'
import api from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { cn } from '../../utils/cn'
import {
  clearCart,
  getCartItems,
  removeCourseFromCart,
  type CartItem,
} from './cartStore'

type PaymentMethod = 'vnpay_sandbox' | 'momo_sandbox'

const COUPON_RATES: Record<string, number> = {
  SMARTEDU10: 0.1,
  SV2026: 0.15,
  GIAM20: 0.2,
}

export function CartCheckout() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vnpay_sandbox')
  const [submitting, setSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  useEffect(() => {
    setItems(getCartItems())
  }, [])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.locked_unit_price, 0),
    [items]
  )

  const discountRate = appliedCoupon ? COUPON_RATES[appliedCoupon] || 0 : 0
  const discountAmount = Math.round(subtotal * discountRate)
  const finalTotal = Math.max(0, subtotal - discountAmount)

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price)

  const handleRemove = (courseId: string) => {
    setItems(removeCourseFromCart(courseId))
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    const code = couponInput.trim().toUpperCase()
    if (!code) {
      setAppliedCoupon(null)
      setCouponError(null)
      return
    }
    if (COUPON_RATES[code]) {
      setAppliedCoupon(code)
      setCouponError(null)
    } else {
      setAppliedCoupon(null)
      setCouponError('Mã giảm giá không hợp lệ. Thử: SMARTEDU10 hoặc SV2026.')
    }
  }

  const handleCheckout = async () => {
    if (items.length === 0) return
    setSubmitting(true)
    setCheckoutError(null)

    const fallbackTxn = `SE-${Date.now()}`

    try {
      const res = await api.post('/api/v1/orders/checkout', {
        course_ids: items.map((i) => i.course_id),
        locked_items: items.map((i) => ({
          course_id: i.course_id,
          unit_price: i.locked_unit_price,
        })),
        coupon_code: appliedCoupon,
        payment_method: paymentMethod,
      })

      const data = res.data as {
        order_id?: string
        transaction_id?: string
        payment_url?: string
      }

      if (data?.payment_url) {
        window.location.assign(data.payment_url)
        return
      }

      const txnId = data?.transaction_id || data?.order_id || fallbackTxn
      clearCart()
      router.push(
        `/app/student/payment-result?txn_ref=${encodeURIComponent(txnId)}&amount=${finalTotal}&method=${paymentMethod}`
      )
    } catch {
      // Fallback to sandbox verification page (never fakes success on client)
      router.push(
        `/app/student/payment-result?txn_ref=${encodeURIComponent(fallbackTxn)}&amount=${finalTotal}&method=${paymentMethod}`
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in font-body pb-12">
      {/* Header */}
      <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-surface-elevated via-primary/5 to-surface p-5 sm:p-7 shadow-soft space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>Giỏ hàng & Chốt đơn giữ giá</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          Thanh toán khóa học nội bộ SmartEdu
        </h1>
        <p className="text-sm text-muted-foreground">
          Chỉ khóa học nội bộ đã kiểm duyệt mới được thêm vào giỏ. Đơn giá được chốt cố định tại thời điểm tạo đơn.
        </p>
      </div>

      {items.length === 0 ? (
        <Card padding="responsive" className="text-center py-12 space-y-4">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <ShoppingCart className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">Giỏ hàng của bạn đang trống</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Khám phá danh mục khóa học nội bộ SmartEdu và thêm khóa học phù hợp vào giỏ hàng để thanh toán.
            </p>
          </div>
          <Link href="/app/student/browse">
            <Button size="sm" icon={<ArrowRight className="h-4 w-4" />}>
              Khám phá khóa học
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <Card
                key={item.course_id}
                padding="responsive"
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="success" label="Khóa nội bộ SmartEdu" />
                    <span className="inline-flex items-center gap-1 text-3xs text-muted-foreground">
                      <Lock className="h-3 w-3 text-primary" />
                      Đã chốt đơn giá
                    </span>
                  </div>
                  <Link
                    href={`/app/student/courses/${item.course_id}`}
                    className="block text-sm font-bold text-foreground hover:text-primary transition-colors"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">Giảng viên: {item.lecturer_name}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-base font-extrabold text-primary">
                      {item.locked_unit_price === 0
                        ? 'Miễn phí'
                        : `${formatPrice(item.locked_unit_price)}đ`}
                    </div>
                    <div className="text-3xs text-muted-foreground">Đơn giá chốt</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.course_id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="Xóa khỏi giỏ hàng"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Right: Order Confirmation & Sandbox Payment */}
          <div className="space-y-4">
            <Card padding="responsive" className="space-y-4 lg:sticky lg:top-4">
              <h2 className="text-base font-bold text-foreground">Xác nhận đơn hàng</h2>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="VD: SMARTEDU10"
                    className="flex-1 h-9 rounded-xl border border-input bg-background px-3 text-xs uppercase focus:border-primary focus:outline-none"
                  />
                  <Button type="submit" size="sm" variant="outline">
                    Áp dụng
                  </Button>
                </div>
                {appliedCoupon && (
                  <p className="text-2xs text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Đã áp dụng mã {appliedCoupon} (-{Math.round(discountRate * 100)}%)
                  </p>
                )}
                {couponError && <p className="text-2xs text-destructive">{couponError}</p>}
              </form>

              {/* Payment Method */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  Cổng thanh toán Sandbox
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'vnpay_sandbox', label: 'VNPay Sandbox' },
                    { id: 'momo_sandbox', label: 'MoMo Sandbox' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={cn(
                        'px-3 py-2 rounded-xl border text-xs font-semibold transition-all',
                        paymentMethod === m.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-3 border-t border-border/60 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính ({items.length} khóa)</span>
                  <span>{formatPrice(subtotal)}đ</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Giảm giá</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    -{formatPrice(discountAmount)}đ
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-foreground pt-2 border-t border-border/60">
                  <span>Tổng thanh toán (giữ giá)</span>
                  <span className="text-primary">{formatPrice(finalTotal)}đ</span>
                </div>
              </div>

              {checkoutError && (
                <p className="text-xs text-destructive text-center">{checkoutError}</p>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={submitting}
              >
                {submitting ? 'Đang khởi tạo giao dịch...' : 'Chốt đơn & Thanh toán Sandbox'}
              </Button>

              <div className="flex items-start gap-2 text-3xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>
                  Trạng thái thanh toán luôn được xác minh trực tiếp qua Backend API sau khi chuyển hướng.
                </span>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
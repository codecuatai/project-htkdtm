'use client'

/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import api from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

type VerifyStatus = 'verifying' | 'success' | 'failed'

export function PaymentResult() {
  const [status, setStatus] = useState<VerifyStatus>('verifying')
  const [txnRef, setTxnRef] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [method, setMethod] = useState<string>('sandbox')
  const [message, setMessage] = useState<string>(
    'Hệ thống đang gọi máy chủ SmartEdu để xác minh trạng thái giao dịch cuối cùng...'
  )

  const verifyWithBackend = useCallback(async (transactionId: string) => {
    setStatus('verifying')
    setMessage('Đang xác minh giao dịch với máy chủ Backend...')

    if (!transactionId) {
      setStatus('failed')
      setMessage('Thiếu mã giao dịch để xác minh. Vui lòng kiểm tra lại đơn hàng.')
      return
    }

    try {
      // Always verify final status with backend instead of trusting redirect query params
      const res = await api.get(`/api/v1/payments/verify`, {
        params: { txn_ref: transactionId },
      })
      const payload = res.data as {
        status?: string
        verified?: boolean
        message?: string
      }

      const normalized = (payload?.status || '').toLowerCase()
      if (payload?.verified === true || normalized === 'paid' || normalized === 'success') {
        setStatus('success')
        setMessage(
          payload?.message || 'Thanh toán đã được Backend xác nhận thành công. Khóa học đã sẵn sàng.'
        )
      } else {
        setStatus('failed')
        setMessage(
          payload?.message ||
            'Giao dịch chưa được Backend xác nhận thành công. Vui lòng thử lại.'
        )
      }
    } catch {
      // Never fake success when backend callback has not confirmed
      setStatus('failed')
      setMessage(
        'Chưa nhận được xác nhận thành công từ Backend cho giao dịch này (UI không tự báo thành công giả). Vui lòng thử xác minh lại hoặc thanh toán lại.'
      )
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const sp = new URLSearchParams(window.location.search)
    const ref = sp.get('txn_ref') || sp.get('vnp_TxnRef') || sp.get('orderId') || ''
    const rawAmount = Number(sp.get('amount') || 0)
    const payMethod = sp.get('method') || 'sandbox'

    setTxnRef(ref)
    setAmount(Number.isFinite(rawAmount) ? rawAmount : 0)
    setMethod(payMethod)
    verifyWithBackend(ref)
  }, [verifyWithBackend])

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price)

  return (
    <div className="max-w-xl mx-auto py-8 animate-fade-in font-body">
      <Card padding="responsive" className="space-y-6 text-center">
        {/* Status Icon & Title */}
        <div className="space-y-3">
          {status === 'verifying' && (
            <>
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
              <Badge variant="primary" label="Đang xác minh" />
              <h1 className="text-xl font-extrabold text-foreground">
                Đang xác minh thanh toán...
              </h1>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <Badge variant="success" label="Thành công" />
              <h1 className="text-xl font-extrabold text-foreground">
                Thanh toán thành công!
              </h1>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
                <XCircle className="h-9 w-9" />
              </div>
              <Badge variant="warning" label="Thất bại / Chưa xác nhận" />
              <h1 className="text-xl font-extrabold text-foreground">
                Giao dịch chưa hoàn tất
              </h1>
            </>
          )}

          <p className="text-xs text-muted-foreground max-w-md mx-auto">{message}</p>
        </div>

        {/* Transaction Info */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4 text-left space-y-2 text-xs">
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Mã giao dịch:</span>
            <span className="font-mono font-bold text-foreground">
              {txnRef || 'Không có mã'}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Cổng thanh toán:</span>
            <span className="font-semibold text-foreground uppercase">{method}</span>
          </div>
          {amount > 0 && (
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Số tiền chốt đơn:</span>
              <span className="font-bold text-primary">{formatPrice(amount)}đ</span>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-2 rounded-xl border border-border/70 bg-background p-3 text-left text-3xs text-muted-foreground">
          <ShieldAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span>
            Bảo mật thanh toán: SmartEdu chỉ kích hoạt ghi danh sau khi API Backend xác nhận chữ ký callback hợp lệ từ cổng thanh toán.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {status === 'success' ? (
            <Link href="/app/student/courses">
              <Button size="lg">Vào khóa học của tôi</Button>
            </Link>
          ) : status === 'failed' ? (
            <>
              <Button
                variant="outline"
                onClick={() => verifyWithBackend(txnRef)}
                icon={<RefreshCw className="h-4 w-4" />}
              >
                Kiểm tra lại trạng thái
              </Button>
              <Link href="/app/student/cart">
                <Button>Thử thanh toán lại</Button>
              </Link>
            </>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
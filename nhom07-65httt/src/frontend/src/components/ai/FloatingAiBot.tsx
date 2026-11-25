'use client'

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { usePathname } from 'next/navigation'
import { Maximize2, Minimize2, Plus, Sparkles, X } from 'lucide-react'
import { useAppStore } from '../../stores/appStore'
import { ChatPanel } from '../../features/chat/ChatPanel'
import { cn } from '../../utils/cn'

const STORAGE_KEY = 'learninghub_ai_bot_pos'
const BOT_SIZE = 72
const MARGIN = 16
const DRAG_THRESHOLD = 6

interface Position {
  x: number
  y: number
}

function clampPosition(pos: Position): Position {
  if (typeof window === 'undefined') return pos
  const maxX = Math.max(MARGIN, window.innerWidth - BOT_SIZE - MARGIN)
  const maxY = Math.max(MARGIN, window.innerHeight - BOT_SIZE - MARGIN)
  return {
    x: Math.min(Math.max(MARGIN, pos.x), maxX),
    y: Math.min(Math.max(MARGIN, pos.y), maxY),
  }
}

function LearningHubMascot({ isOpen, isDragging }: { isOpen: boolean; isDragging: boolean }) {
  return (
    <div className="relative flex flex-col items-center select-none pointer-events-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ai-mascot.png"
        alt="Learning Hub AI Mascot"
        width={68}
        height={68}
        draggable={false}
        className={cn(
          'h-[68px] w-[68px] object-contain drop-shadow-[0_8px_16px_rgba(162,28,175,0.38)] transition-transform duration-200',
          !isDragging && !isOpen && 'animate-float',
          isOpen && 'scale-95',
          isDragging && 'scale-110 -rotate-3'
        )}
      />

      {/* Soft ground shadow */}
      <div
        className={cn(
          'mt-0.5 h-1.5 w-8 rounded-full bg-fuchsia-950/30 dark:bg-fuchsia-400/25 blur-[2px] transition-all duration-200',
          isDragging ? 'w-10 opacity-40' : 'opacity-70'
        )}
      />
    </div>
  )
}

export function FloatingAiBot() {
  const pathname = usePathname() ?? ''
  const user = useAppStore((s) => s.auth.user)
  const addSession = useAppStore((s) => s.chat.addSession)

  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })

  const dragStateRef = useRef<{
    pointerId: number
    startClientX: number
    startClientY: number
    startPosX: number
    startPosY: number
    moved: boolean
  } | null>(null)

  const shouldRender = Boolean(user) && pathname.startsWith('/app') && !pathname.startsWith('/app/student/chat')

  useEffect(() => {
    const defaultPos = clampPosition({
      x: window.innerWidth - BOT_SIZE - 24,
      y: window.innerHeight - BOT_SIZE - 28,
    })
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Position
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setPosition(clampPosition(parsed))
        } else {
          setPosition(defaultPos)
        }
      } else {
        setPosition(defaultPos)
      }
    } catch {
      setPosition(defaultPos)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const handleResize = () => {
      setPosition((prev) => clampPosition(prev))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [mounted])

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return
      e.currentTarget.setPointerCapture(e.pointerId)
      dragStateRef.current = {
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startPosX: position.x,
        startPosY: position.y,
        moved: false,
      }
    },
    [position.x, position.y]
  )

  const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragStateRef.current
    if (!drag || drag.pointerId !== e.pointerId) return

    const dx = e.clientX - drag.startClientX
    const dy = e.clientY - drag.startClientY

    if (!drag.moved && Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
      drag.moved = true
      setIsDragging(true)
    }

    if (drag.moved) {
      setPosition(
        clampPosition({
          x: drag.startPosX + dx,
          y: drag.startPosY + dy,
        })
      )
    }
  }, [])

  const handlePointerUp = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragStateRef.current
    if (!drag || drag.pointerId !== e.pointerId) return

    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // Ignore if capture was already released
    }

    const wasMoved = drag.moved
    dragStateRef.current = null
    setIsDragging(false)

    if (wasMoved) {
      setPosition((current) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
        } catch {
          // Ignore storage quota errors
        }
        return current
      })
    } else {
      setIsOpen((prev) => !prev)
    }
  }, [])

  if (!mounted || !shouldRender) return null

  return (
    <>
      {/* Floating Chat Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Trợ lý AI Learning Hub"
          className={cn(
            'fixed z-[60] flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-fuchsia-950/20 dark:shadow-black/50 transition-all duration-200 animate-zoom-in-95',
            isExpanded
              ? 'bottom-4 right-4 h-[min(760px,calc(100vh-32px))] w-[min(740px,calc(100vw-32px))]'
              : 'bottom-24 right-5 h-[min(600px,calc(100vh-120px))] w-[min(430px,calc(100vw-28px))]'
          )}
        >
          {/* Floating Window Header */}
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-primary via-fuchsia-600 to-accent px-4 py-2.5 text-white shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight truncate">
                  Trợ lý Learning Hub AI
                </p>
                <p className="text-[11px] text-white/80 leading-tight truncate">
                  Hỏi đáp &amp; hỗ trợ học tập tức thì
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => addSession()}
                title="Cuộc trò chuyện mới"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/85 hover:bg-white/20 hover:text-white transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded((v) => !v)}
                title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/85 hover:bg-white/20 hover:text-white transition-colors"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Đóng (Esc)"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/85 hover:bg-white/20 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Embedded AI Chat Panel */}
          <div className="flex-1 min-h-0 overflow-hidden [&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Đang khởi tạo trợ lý AI...
                </div>
              }
            >
              <ChatPanel />
            </Suspense>
          </div>
        </div>
      )}

      {/* Draggable Floating Mascot Bot */}
      <div
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
        className="fixed left-0 top-0 z-[65] touch-none select-none"
      >
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label={isOpen ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'}
          className={cn(
            'group relative flex h-[72px] w-[72px] items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          )}
        >
          {/* Hover tooltip pill */}
          {!isDragging && !isOpen && (
            <span className="pointer-events-none absolute -top-9 right-0 whitespace-nowrap rounded-full border border-fuchsia-500/30 bg-card/95 px-2.5 py-1 text-[11px] font-medium text-foreground opacity-0 shadow-md backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100">
              Trợ lý AI · Kéo để di chuyển
            </span>
          )}

          {/* Online pulse badge */}
          <span className="pointer-events-none absolute right-1.5 top-1.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-card bg-pink-500" />
          </span>

          <LearningHubMascot isOpen={isOpen} isDragging={isDragging} />
        </button>
      </div>
    </>
  )
}

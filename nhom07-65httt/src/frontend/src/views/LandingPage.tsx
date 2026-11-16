'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  BrainCircuit,
  Award,
  FileText,
  Zap,
  ChevronDown,
  Compass,
  Laptop,
  Menu,
  Check,
  X,
  Target,
  Bot
} from 'lucide-react'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { Button } from '../components/ui/Button'
import { cn } from '../utils/cn'

// Animated number counter hook/component
function AnimatedCounter({
  end,
  duration = 1800,
  suffix = '',
  decimals = 0
}: {
  end: number
  duration?: number
  suffix?: string
  decimals?: number
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    let animationFrameId: number

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(ease * end)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step)
      }
    }

    animationFrameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrameId)
  }, [end, duration])

  return (
    <span>
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  )
}

export function LandingPage() {
  const router = useRouter()
  const [activeRole, setActiveRole] = useState<'student' | 'lecturer'>('student')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Interactive Live Demo in Hero Mockup
  const [heroTab, setHeroTab] = useState<'rag' | 'quiz' | 'radar'>('rag')
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const tickerItems = [
    '⚡ Multimodal RAG Học Thuật',
    '📑 Giáo Trình PDF & Slide PPTX',
    '🎬 Video Bài Giảng MP4 Có Timestamp',
    '📊 Khai Phá Dữ Liệu & BI',
    '🧠 Sinh Quiz 4 Lựa Chọn Sau 5s',
    '🛡️ Chuẩn Thị Giác WCAG AAA',
    '🎯 Chẩn Đoán Lỗ Hổng Kiến Thức',
    '💡 Spaced Repetition Flashcards',
    '📈 Chấm Tự Luận Theo Rubric'
  ]

  const faqs = [
    {
      q: 'AI của Learning Hub có bịa đặt (hallucination) kiến thức không?',
      a: 'Không. Hệ thống áp dụng kiến trúc RAG Đa phương thức (Multimodal Retrieval-Augmented Generation) nghiêm ngặt. Mọi câu trả lời của Trợ lý AI đều được neo chặt vào tài liệu học phần do giảng viên hoặc sinh viên tải lên, kèm trích dẫn chính xác số trang sách PDF hoặc mốc thời gian video để người học kiểm chứng tức thì.'
    },
    {
      q: 'Bảng màu công thái học (Eye-Care Technology) giúp ích gì cho sinh viên?',
      a: 'Hệ thống tuân thủ chuẩn tương phản WCAG AAA, sử dụng tông Slate Paper (#F8FAFC) cho Light Mode và Midnight Slate (#0B1323) cho Dark Mode. Bảng màu này loại bỏ hiện tượng chói lóa ánh sáng xanh và triệt tiêu bóng ma quang học (Halation Effect), giúp mắt không phải điều tiết quá mức khi học bài liên tục 4–6 tiếng.'
    },
    {
      q: 'Giảng viên có thể ứng dụng Learning Hub như thế nào?',
      a: 'Giảng viên có thể tạo khóa học theo cấu trúc chương mục, tải lên video bài giảng, PDF giáo trình; Trợ lý AI sẽ tự động phác thảo đề tài, sinh ngân hàng câu hỏi trắc nghiệm và cung cấp bảng điều khiển phân tích chi tiết những câu hỏi sinh viên hay làm sai nhất.'
    },
    {
      q: 'Nền tảng hỗ trợ những định dạng học liệu nào?',
      a: 'Learning Hub hỗ trợ đa định dạng: Tài liệu văn bản (PDF, DOCX, TXT), hình ảnh biểu đồ tài liệu, video bài giảng MP4, audio podcast (chuyển ngữ âm thanh bằng Whisper) và các liên kết bài giảng trực tuyến.'
    },
    {
      q: 'Hệ thống có thể dùng được trên điện thoại và máy tính bảng không?',
      a: 'Hoàn toàn được. Toàn bộ giao diện được thiết kế Responsive 100%, có thanh điều hướng Mobile Drawer tiện lợi, giúp bạn vừa học trên laptop vừa ôn bài qua điện thoại bất cứ lúc nào.'
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground font-body selection:bg-primary/20 selection:text-foreground">
      {/* 1. STICKY NAVBAR (Sạch sẽ, thương mại, bỏ badge nhóm trường học) */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo - Chuyên nghiệp, hiện đại */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-indigo-600 to-accent text-primary-foreground shadow-sm shadow-primary/25 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-foreground">Learning Hub</span>
                <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  AI v2.0
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-foreground/80">
            <button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors">
              Tính năng AI
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-primary transition-colors">
              Cách hoạt động
            </button>
            <button onClick={() => scrollToSection('roles')} className="hover:text-primary transition-colors">
              Không gian vai trò
            </button>
            <button onClick={() => scrollToSection('comparison')} className="hover:text-primary transition-colors">
              So sánh
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-primary transition-colors">
              Hỏi đáp
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />
            <button
              onClick={() => router.push('/login')}
              className="text-sm font-bold text-foreground/80 hover:text-primary px-3 py-2 rounded-xl transition-colors"
            >
              Đăng nhập
            </button>
            <Button
              onClick={() => router.push('/welcome')}
              className="h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-primary text-primary-foreground shadow-sm hover:opacity-95 transition-all"
            >
              <span>Trải nghiệm ngay</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 hidden sm:inline" />
            </Button>
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-surface-elevated px-4 pt-3 pb-5 space-y-2 animate-fade-in shadow-lift">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 text-sm font-semibold text-foreground">
              Tính năng AI
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-2 text-sm font-semibold text-foreground">
              Cách hoạt động
            </button>
            <button onClick={() => scrollToSection('roles')} className="block w-full text-left py-2 text-sm font-semibold text-foreground">
              Không gian vai trò
            </button>
            <button onClick={() => scrollToSection('comparison')} className="block w-full text-left py-2 text-sm font-semibold text-foreground">
              So sánh
            </button>
            <button onClick={() => scrollToSection('faq')} className="block w-full text-left py-2 text-sm font-semibold text-foreground">
              Hỏi đáp
            </button>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-18 md:pb-24">
        {/* Glow ambient background orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[280px] bg-accent/15 rounded-full blur-[110px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6 sm:space-y-8">
          {/* Top Sleek Pill Badge (Đã thay badge học phần cũ) */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15 border border-primary/30 text-primary text-xs font-bold animate-fade-in shadow-2xs backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span>Nền tảng Học tập Đa phương thức AI Thế Hệ Mới</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-ping ml-1" />
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15]">
            Biến Mọi Giáo Trình Phức Tạp Thành{' '}
            <span className="bg-gradient-to-r from-primary via-blue-600 to-accent dark:from-primary dark:via-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
              Tri Thức Tương Tác Sâu
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Đột phá hiệu suất học tập với Gia sư AI đối chiếu chính xác số trang tài liệu gốc, bộ sinh trắc nghiệm tự động và bảng màu công thái học bảo vệ mắt suốt 6 giờ liên tục.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Button
              onClick={() => router.push('/welcome')}
              className="h-12 px-7 rounded-2xl text-base font-bold bg-primary text-primary-foreground shadow-md hover:shadow-glow hover:opacity-95 transition-all w-full sm:w-auto"
            >
              <span>Bắt đầu học miễn phí</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => scrollToSection('features')}
              className="h-12 px-7 rounded-2xl text-base font-semibold border-border bg-surface-elevated hover:bg-muted text-foreground w-full sm:w-auto"
            >
              <Compass className="h-4 w-4 mr-2 text-primary" />
              <span>Khám phá tính năng</span>
            </Button>
          </div>

          {/* Trust Highlights */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>Chuẩn thị giác WCAG AAA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>RAG Đa phương thức (PDF, Video, DOCX)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>Zero-Hallucination Verified</span>
            </div>
          </div>

          {/* HERO PREVIEW MOCKUP WITH DYNAMIC INTERACTION & FLOATING BADGES */}
          <div className="pt-8 sm:pt-12 max-w-5xl mx-auto relative">
            {/* Floating Dynamic Badge 1: Top Right */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-surface-elevated border border-primary/30 shadow-lift absolute -top-4 -right-4 z-20 animate-float backdrop-blur-md">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Laptop className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-2xs font-extrabold text-foreground">Chuẩn WCAG AAA</p>
                <p className="text-3xs text-success font-semibold">Giảm 40% mỏi mắt</p>
              </div>
            </div>

            {/* Floating Dynamic Badge 2: Bottom Left */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-surface-elevated border border-success/30 shadow-lift absolute -bottom-5 -left-4 z-20 animate-float-delayed backdrop-blur-md">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-success/15 text-success">
                <Target className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-2xs font-extrabold text-foreground">Trích Dẫn Nguồn RAG</p>
                <p className="text-3xs text-primary font-semibold">Khớp 100% tài liệu gốc</p>
              </div>
            </div>

            {/* Window Container */}
            <div className="rounded-3xl border border-border/80 bg-surface-elevated/95 p-2.5 sm:p-4 shadow-lift backdrop-blur-xl transition-all">
              {/* Window Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                {/* Interactive Demo Tabs inside Mockup */}
                <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/40 gap-1 text-3xs font-semibold">
                  <button
                    onClick={() => setHeroTab('rag')}
                    className={cn(
                      'px-3 py-1 rounded-lg transition-all',
                      heroTab === 'rag' ? 'bg-surface-elevated text-primary shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    1. Gia sư RAG
                  </button>
                  <button
                    onClick={() => setHeroTab('quiz')}
                    className={cn(
                      'px-3 py-1 rounded-lg transition-all',
                      heroTab === 'quiz' ? 'bg-surface-elevated text-accent shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    2. Trắc nghiệm AI (Bấm thử)
                  </button>
                  <button
                    onClick={() => setHeroTab('radar')}
                    className={cn(
                      'px-3 py-1 rounded-lg transition-all',
                      heroTab === 'radar' ? 'bg-surface-elevated text-warning shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    3. Radar điểm yếu
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success animate-ping" />
                  <span className="text-3xs font-bold text-success hidden sm:inline">Interactive Demo</span>
                </div>
              </div>

              {/* Window Content Simulation */}
              <div className="p-4 sm:p-6 text-left bg-background/50 rounded-2xl min-h-[220px]">
                {heroTab === 'rag' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* User Question */}
                    <div className="flex items-start gap-3 justify-end">
                      <div className="p-3 rounded-2xl bg-primary text-primary-foreground text-xs font-medium max-w-md shadow-xs">
                        Giải thích cơ chế Lan truyền ngược (Backpropagation) trong mạng nơ-ron?
                      </div>
                      <div className="flex h-7 w-7 rounded-full bg-muted items-center justify-center font-bold text-2xs">
                        Bạn
                      </div>
                    </div>

                    {/* AI Response with page citations */}
                    <div className="p-4 rounded-2xl border border-primary/20 bg-surface-elevated space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-xs shadow-xs">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">Gia sư AI Tutor</span>
                            <span className="inline-flex items-center gap-1 text-3xs font-bold px-2 py-0.5 rounded-full bg-success/15 text-success">
                              <CheckCircle2 className="h-3 w-3" /> Đã kiểm chứng tài liệu
                            </span>
                          </div>
                          <p className="text-xs text-foreground/90 leading-relaxed">
                            Thuật toán Lan truyền ngược (Backpropagation) tính đạo hàm của hàm mất mát đối với từng trọng số nhờ quy tắc chuỗi vi phân (Chain Rule), sau đó cập nhật trọng số bằng Gradient Descent từ tầng đầu ra ngược về tầng đầu vào.
                          </p>
                          <div className="pt-1 flex flex-wrap items-center gap-2 text-3xs font-semibold">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20">
                              📄 Trang 42 · Slide_Chuong3_NeuralNet.pdf
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                              ⏱️ Mốc video: 14:25s · BaiGiang_Buoi5.mp4
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {heroTab === 'quiz' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between pb-1 border-b border-border/50">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
                        Câu hỏi do AI sinh tức thì từ giáo trình:
                      </span>
                      <span className="text-3xs font-semibold text-muted-foreground">Bấm chọn để kiểm tra</span>
                    </div>
                    <p className="text-xs font-bold text-foreground">
                      Độ phức tạp thời gian trung bình (Average Time Complexity) của giải thuật QuickSort là gì?
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 0, text: 'A. O(N²)', correct: false },
                        { id: 1, text: 'B. O(N log N)', correct: true },
                        { id: 2, text: 'C. O(N)', correct: false },
                        { id: 3, text: 'D. O(log N)', correct: false }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setQuizAnswer(opt.id)}
                          className={cn(
                            'p-2.5 rounded-xl border text-left font-medium transition-all cursor-pointer flex items-center justify-between',
                            quizAnswer === null && 'bg-surface hover:bg-muted border-border text-foreground',
                            quizAnswer === opt.id && opt.correct && 'bg-success/15 border-success text-success font-bold scale-[1.02]',
                            quizAnswer === opt.id && !opt.correct && 'bg-destructive/15 border-destructive text-destructive font-bold',
                            quizAnswer !== null && quizAnswer !== opt.id && opt.correct && 'bg-success/10 border-success/30 text-success',
                            quizAnswer !== null && quizAnswer !== opt.id && !opt.correct && 'bg-surface border-border opacity-50'
                          )}
                        >
                          <span>{opt.text}</span>
                          {quizAnswer === opt.id && (opt.correct ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-destructive" />)}
                        </button>
                      ))}
                    </div>
                    {quizAnswer !== null && (
                      <div className="p-2.5 rounded-xl bg-surface border border-border text-2xs text-muted-foreground flex items-center gap-2">
                        {quizAnswer === 1 ? (
                          <span className="text-success font-bold">🎉 Chính xác! QuickSort có thời gian trung bình O(N log N).</span>
                        ) : (
                          <span className="text-amber-500 font-bold">💡 Chưa chính xác. Đáp án đúng là B: O(N log N). Hãy xem lại slide phân tích thuật toán!</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {heroTab === 'radar' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between pb-1 border-b border-border/50">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-warning" />
                        Chẩn đoán mức độ nắm bắt kiến thức:
                      </span>
                      <span className="text-3xs font-bold text-success">Đã hoàn thành 85%</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between text-2xs font-semibold mb-1">
                          <span className="text-foreground">Chuẩn hóa CSDL (3NF, BCNF)</span>
                          <span className="text-success">95% (Vững chắc)</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-success rounded-full" style={{ width: '95%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-2xs font-semibold mb-1">
                          <span className="text-foreground">Kiến trúc Big Data & MapReduce</span>
                          <span className="text-amber-500 font-bold">58% (Cần ôn tập thêm)</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '58%' }} />
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-2xs text-foreground/80 flex items-center justify-between">
                      <span>AI đã tạo bộ 5 câu ôn bù đắp cho phần MapReduce</span>
                      <button 
                        onClick={() => router.push('/app/student/quiz')}
                        className="px-2 py-1 rounded bg-amber-500 text-white font-bold hover:bg-amber-600 transition"
                      >
                        Làm ngay →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 INFINITE MARQUEE TICKER (Dải băng chuyền chuyển động liên tục) */}
      <div className="w-full overflow-hidden border-y border-border/60 bg-surface/40 py-3">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap text-xs font-bold text-muted-foreground/80">
          {tickerItems.concat(tickerItems).map((item, idx) => (
            <span key={idx} className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
              <span>{item}</span>
              <span className="text-border text-base">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* 3. METRICS BAR VỚI CON SỐ CHẠY ĐỘNG (ANIMATED NUMBERS) */}
      <section className="bg-surface/50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {/* Stat 1 */}
            <div className="space-y-1 p-4 rounded-2xl bg-surface-elevated/50 border border-border/40 hover:border-primary/40 hover:-translate-y-1 transition-all">
              <p className="text-3xl sm:text-5xl font-black text-primary tabular-nums">
                <AnimatedCounter end={5} suffix="x" />
              </p>
              <p className="text-xs sm:text-sm font-bold text-foreground">Tốc độ tiếp thu giáo trình</p>
              <p className="text-3xs text-muted-foreground">Tóm tắt & bóc tách trọng tâm tức thì</p>
            </div>

            {/* Stat 2 */}
            <div className="space-y-1 p-4 rounded-2xl bg-surface-elevated/50 border border-border/40 hover:border-accent/40 hover:-translate-y-1 transition-all">
              <p className="text-3xl sm:text-5xl font-black text-accent tabular-nums">
                <AnimatedCounter end={99.2} decimals={1} suffix="%" />
              </p>
              <p className="text-xs sm:text-sm font-bold text-foreground">Độ chính xác trích dẫn RAG</p>
              <p className="text-3xs text-muted-foreground">Đối chiếu sách gốc, loại bỏ bịa đặt</p>
            </div>

            {/* Stat 3 */}
            <div className="space-y-1 p-4 rounded-2xl bg-surface-elevated/50 border border-border/40 hover:border-success/40 hover:-translate-y-1 transition-all">
              <p className="text-3xl sm:text-5xl font-black text-success tabular-nums">
                <AnimatedCounter end={10000} suffix="+" />
              </p>
              <p className="text-xs sm:text-sm font-bold text-foreground">Quiz & Flashcard tự động</p>
              <p className="text-3xs text-muted-foreground">Sinh trắc nghiệm 4 lựa chọn có giải thích</p>
            </div>

            {/* Stat 4 */}
            <div className="space-y-1 p-4 rounded-2xl bg-surface-elevated/50 border border-border/40 hover:border-warning/40 hover:-translate-y-1 transition-all">
              <p className="text-3xl sm:text-5xl font-black text-warning tabular-nums">
                <AnimatedCounter end={40} suffix="%" />
              </p>
              <p className="text-xs sm:text-sm font-bold text-foreground">Giảm mỏi mắt khi học lâu</p>
              <p className="text-3xs text-muted-foreground">Chuẩn công thái học thị giác WCAG AAA</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BENTO GRID FEATURES */}
      <section id="features" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Bộ công cụ cốt lõi</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Kho "Vũ Khí" Thông Minh Của Multimodal Learning Hub
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Tích hợp toàn diện các mô hình ngôn ngữ lớn, công nghệ tìm kiếm ngữ nghĩa vector và kiến trúc công thái học.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Large Multimodal RAG */}
          <div className="md:col-span-2 rounded-3xl border border-border/80 bg-surface-elevated p-6 sm:p-8 space-y-4 hover:border-primary/50 hover:shadow-soft hover:-translate-y-0.5 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Gia sư AI Đa phương thức (Multimodal RAG)</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Truyền phát câu trả lời trực tiếp (SSE Streaming) từ tài liệu thực tế của bạn. Hỗ trợ bóc tách biểu đồ, văn bản trong PDF, Slide PowerPoint và video bài giảng, kèm trích dẫn số trang chính xác giúp bạn tự tin kiểm chứng.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-2xs font-semibold text-muted-foreground">
              <span className="px-3 py-1 rounded-lg bg-surface border border-border">PDF & DOCX Deep Parsing</span>
              <span className="px-3 py-1 rounded-lg bg-surface border border-border">Qdrant Vector Database</span>
              <span className="px-3 py-1 rounded-lg bg-surface border border-border">Trích dẫn số trang & Timestamp</span>
            </div>
          </div>

          {/* Card 2: AI Quiz Generator */}
          <div className="rounded-3xl border border-border/80 bg-surface-elevated p-6 sm:p-8 space-y-4 hover:border-accent/50 hover:shadow-soft hover:-translate-y-0.5 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Sinh Trắc Nghiệm Tức Thì</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Biến 50 trang tài liệu ôn tập thành ngân hàng đề thi 4 lựa chọn sau 5 giây, có lời giải chi tiết và phân loại độ khó.
            </p>
            <span className="inline-block text-2xs font-semibold text-accent">Luyện phản xạ đề thi thực chiến →</span>
          </div>

          {/* Card 3: Adaptive Remediation */}
          <div className="rounded-3xl border border-border/80 bg-surface-elevated p-6 sm:p-8 space-y-4 hover:border-warning/50 hover:shadow-soft hover:-translate-y-0.5 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 text-warning">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Chẩn Đoán Lỗ Hổng Kiến Thức</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hệ thống theo dõi các câu làm sai, định vị chính xác chuyên đề bạn còn yếu và tự động tạo bài tập bù đắp tức thì.
            </p>
            <span className="inline-block text-2xs font-semibold text-warning">Học trúng đích, không học vẹt →</span>
          </div>

          {/* Card 4: Essay Grading */}
          <div className="rounded-3xl border border-border/80 bg-surface-elevated p-6 sm:p-8 space-y-4 hover:border-success/50 hover:shadow-soft hover:-translate-y-0.5 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Chấm Tự Luận Đối Chiếu Nguồn</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI chấm điểm bài luận theo tiêu chí rubric, đối chiếu với giáo trình gốc và chỉ ra các luận điểm còn thiếu sót.
            </p>
            <span className="inline-block text-2xs font-semibold text-success">Đánh giá khách quan & toàn diện →</span>
          </div>

          {/* Card 5: Eye-Care Technology */}
          <div className="rounded-3xl border border-border/80 bg-surface-elevated p-6 sm:p-8 space-y-4 hover:border-primary/50 hover:shadow-soft hover:-translate-y-0.5 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Laptop className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Công Thái Học Chống Mỏi Mắt</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Thiết kế theo quy tắc 60-30-10 với bảng màu Warm Slate và Midnight Navy, triệt tiêu ánh sáng xanh gay gắt khi học đêm.
            </p>
            <span className="inline-block text-2xs font-semibold text-primary">Tập trung bền bỉ suốt 6 giờ →</span>
          </div>
        </div>
      </section>

      {/* 5. QUY TRÌNH 3 BƯỚC (HOW IT WORKS) */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-surface/50 border-y border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Đơn giản & Tối ưu</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              3 Bước Bứt Phá Điểm Số Cùng Learning Hub
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Không cần cấu hình phức tạp, bắt đầu học tập thông minh chỉ sau vài giây.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="rounded-3xl border border-border bg-surface-elevated p-6 sm:p-8 space-y-4 relative shadow-xs hover:-translate-y-1 transition-transform">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-md shadow-primary/20">
                01
              </div>
              <h3 className="text-lg font-bold text-foreground">Nạp Tài Liệu Học Phần</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Kéo thả giáo trình PDF, slide bài giảng PPTX, file Word hoặc video ghi hình buổi học lên kho lưu trữ cá nhân.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl border border-border bg-surface-elevated p-6 sm:p-8 space-y-4 relative shadow-xs hover:-translate-y-1 transition-transform">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground font-black text-sm shadow-md shadow-accent/20">
                02
              </div>
              <h3 className="text-lg font-bold text-foreground">AI Phân Tách & Lập Chỉ Mục</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Celery Worker phân tích văn bản, trích xuất thực thể, tạo nhúng vector và xây dựng mạng lưới tri thức học thuật.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl border border-border bg-surface-elevated p-6 sm:p-8 space-y-4 relative shadow-xs hover:-translate-y-1 transition-transform">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success text-success-foreground font-black text-sm shadow-md shadow-success/20">
                03
              </div>
              <h3 className="text-lg font-bold text-foreground">Tương Tác & Bứt Phá</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hỏi đáp cùng Gia sư AI, luyện đề trắc nghiệm phản xạ, lấp lỗ hổng kiến thức và tự tin chinh phục điểm A+.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DUAL PERSONA TABS */}
      <section id="roles" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Giải pháp toàn diện</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Thiết Kế Chuyên Biệt Cho Người Học & Người Dạy
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Chọn vai trò để khám phá các công cụ thông minh dành riêng cho bạn.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="p-1 rounded-2xl bg-surface border border-border flex items-center gap-1 shadow-2xs">
            <button
              onClick={() => setActiveRole('student')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer',
                activeRole === 'student'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Dành cho Sinh viên</span>
            </button>
            <button
              onClick={() => setActiveRole('lecturer')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer',
                activeRole === 'lecturer'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <BookOpen className="h-4 w-4" />
              <span>Dành cho Giảng viên</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-3xl border border-border/80 bg-surface-elevated p-6 sm:p-10 shadow-lift">
          {activeRole === 'student' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  <span>Trải nghiệm Học tập Chủ động</span>
                </div>
                <h3 className="text-2xl font-black text-foreground">
                  Tự học cá nhân hóa, bứt phá kỳ thi không lo quá tải
                </h3>
                <ul className="space-y-3 text-sm text-foreground/80">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>Hỏi đáp mọi thắc mắc 24/7 với Gia sư AI, không sợ hỏi câu đơn giản.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>Ôn tập với thẻ Flashcard lặp lại ngắt quãng (Spaced Repetition).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>Theo dõi chuỗi học tập (Streak) và mục tiêu ngày để duy trì động lực.</span>
                  </li>
                </ul>
                <div className="pt-2">
                  <Button
                    onClick={() => router.push('/register?role=student')}
                    className="h-11 px-6 rounded-xl font-bold bg-primary text-primary-foreground shadow-sm hover:opacity-95 transition-all"
                  >
                    <span>Vào Không gian Học viên</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground pb-2 border-b border-border">
                  <span>Mục tiêu học tập hôm nay</span>
                  <span className="text-success">Hoàn thành 75%</span>
                </div>
                <div className="space-y-2 text-xs text-foreground/80">
                  <div className="p-2.5 rounded-lg bg-background border border-border flex items-center justify-between">
                    <span>Ôn trắc nghiệm Chương 2: Big Data Architecture</span>
                    <span className="text-3xs font-bold px-2 py-0.5 rounded bg-success/15 text-success">Đã làm</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background border border-border flex items-center justify-between">
                    <span>Hỏi AI giải thích thuật toán K-Means</span>
                    <span className="text-3xs font-bold px-2 py-0.5 rounded bg-primary/15 text-primary">Xong</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold">
                  <span>Quản lý & Giảng dạy Thông minh</span>
                </div>
                <h3 className="text-2xl font-black text-foreground">
                  Số hóa bài giảng, tự động hóa chấm bài & đánh giá năng lực
                </h3>
                <ul className="space-y-3 text-sm text-foreground/80">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>Xuất bản khóa học bài bản theo chương mục kèm học liệu video và PDF.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>Trợ lý AI phác thảo đề thi, bài tập và tóm tắt nội dung bài giảng nhanh chóng.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>Biểu đồ Analytics trực quan chỉ ra các câu hỏi sinh viên hay làm sai nhất để giảng bù.</span>
                  </li>
                </ul>
                <div className="pt-2">
                  <Button
                    onClick={() => router.push('/register?role=lecturer')}
                    className="h-11 px-6 rounded-xl font-bold bg-primary text-primary-foreground shadow-sm hover:opacity-95 transition-all"
                  >
                    <span>Vào Không gian Giảng viên</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground pb-2 border-b border-border">
                  <span>Báo cáo tiến độ lớp học phần</span>
                  <span className="text-primary font-bold">85 học viên</span>
                </div>
                <div className="space-y-2 text-xs text-foreground/80">
                  <div className="p-2.5 rounded-lg bg-background border border-border flex items-center justify-between">
                    <span>Tỷ lệ hoàn thành bài kiểm tra giữa kỳ</span>
                    <span className="font-bold text-success">92%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background border border-border flex items-center justify-between">
                    <span>Chủ đề sinh viên làm sai nhiều nhất</span>
                    <span className="text-3xs font-bold px-2 py-0.5 rounded bg-warning/15 text-warning">Normalization Form 3</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 7. COMPARISON TABLE */}
      <section id="comparison" className="py-16 sm:py-24 bg-surface/50 border-y border-border/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Sự khác biệt</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Học Tập Truyền Thống vs Multimodal Learning Hub
            </h2>
            <p className="text-sm text-muted-foreground">
              So sánh hiệu quả học tập khi áp dụng nền tảng đào tạo AI thông minh.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-border/80 bg-surface-elevated shadow-lift">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-muted/30">
                  <th className="p-4 sm:p-5 font-bold text-foreground">Tiêu chí học tập</th>
                  <th className="p-4 sm:p-5 font-bold text-muted-foreground">Học truyền thống</th>
                  <th className="p-4 sm:p-5 font-bold text-primary">Learning Hub AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-foreground">Tra cứu giáo trình</td>
                  <td className="p-4 sm:p-5 text-muted-foreground">Lật tìm thủ công từng trang sách</td>
                  <td className="p-4 sm:p-5 font-bold text-primary">AI trích dẫn số trang chính xác sau 2 giây</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-foreground">Ôn thi trắc nghiệm</td>
                  <td className="p-4 sm:p-5 text-muted-foreground">Tìm đề cũ trôi nổi, dễ lệch đề cương</td>
                  <td className="p-4 sm:p-5 font-bold text-primary">Sinh đề bám sát slide giáo trình của trường</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-foreground">Phát hiện điểm yếu</td>
                  <td className="p-4 sm:p-5 text-muted-foreground">Chỉ biết khi đã nhận điểm thi thấp</td>
                  <td className="p-4 sm:p-5 font-bold text-primary">Thuật toán chẩn đoán và bù đắp tức thì</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-foreground">Căng thẳng thị giác</td>
                  <td className="p-4 sm:p-5 text-muted-foreground">Mỏi mắt, chói lóa sau 1–2 giờ học</td>
                  <td className="p-4 sm:p-5 font-bold text-primary">Chuẩn WCAG AAA bảo vệ mắt suốt 6 giờ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section id="faq" className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Giải đáp</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Câu Hỏi Thường Gặp
          </h2>
          <p className="text-sm text-muted-foreground">
            Mọi điều bạn cần biết về nền tảng Multimodal AI Learning Hub.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border/80 bg-surface-elevated overflow-hidden transition-all shadow-2xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-foreground hover:text-primary transition-colors gap-4 cursor-pointer"
              >
                <span className="text-sm sm:text-base">{faq.q}</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground',
                    openFaq === idx && 'rotate-180 text-primary'
                  )}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-surface-elevated to-accent/15 p-8 sm:p-14 text-center space-y-6 shadow-lift relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              Sẵn Sàng Nâng Tầm Năng Lực Học Tập Cùng AI?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gia nhập cùng hàng trăm sinh viên đang sử dụng Learning Hub để giải phóng thời gian và đạt kết quả vượt trội.
            </p>
          </div>
          <div className="pt-2">
            <Button
              onClick={() => router.push('/welcome')}
              className="h-12 px-8 rounded-2xl text-base font-bold bg-primary text-primary-foreground shadow-md hover:shadow-glow hover:opacity-95 transition-all"
            >
              <span>Bắt đầu trải nghiệm miễn phí ngay</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-surface/70 py-12 text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="h-6 w-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                <Zap className="h-3.5 w-3.5 fill-current" />
              </div>
              <span className="font-extrabold text-foreground">Learning Hub</span>
            </div>
            <p className="text-xs">Multimodal AI Learning Hub · Nền tảng phát triển năng lực và đào tạo thông minh</p>
            <p className="text-3xs text-muted-foreground/80">
              Học phần: Hệ Thống Kinh Doanh Thông Minh · Lớp: 65HTTT · GVHD: Đỗ Oanh Cường
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold">
            <button onClick={() => router.push('/welcome')} className="hover:text-foreground transition-colors cursor-pointer">
              Chọn vai trò
            </button>
            <button onClick={() => router.push('/login')} className="hover:text-foreground transition-colors cursor-pointer">
              Đăng nhập
            </button>
            <button onClick={() => router.push('/register')} className="hover:text-foreground transition-colors cursor-pointer">
              Đăng ký
            </button>
            <span className="text-muted-foreground/60">Nhóm 07 © 2026</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

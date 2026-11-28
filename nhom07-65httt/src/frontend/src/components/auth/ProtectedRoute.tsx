'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAppStore } from '../../stores/appStore'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
}

/** Chuẩn hóa tên vai trò giữa Backend SmartEdu (STUDENT/INSTRUCTOR/ADMIN/STAFF) và FE cũ */
export function normalizeRole(role?: string | null): string {
  const normalized = role?.trim().toLowerCase() ?? ''
  if (normalized === 'instructor') return 'lecturer'
  return normalized
}

function isRoleAllowed(userRole?: string | null, allowedRoles?: string[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true
  const current = normalizeRole(userRole)
  if (!current) return false
  return allowedRoles.map((r) => normalizeRole(r)).includes(current)
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAppStore((s) => s.auth.isAuthenticated)
  const isLoadingUser = useAppStore((s) => s.auth.isLoadingUser)
  const user = useAppStore((s) => s.auth.user)
  const router = useRouter()
  const pathname = usePathname()

  const roleAllowed = isRoleAllowed(user?.role, allowedRoles)

  useEffect(() => {
    if (isLoadingUser) return
    if (!isAuthenticated || !user) {
      const fromQuery = pathname ? `?from=${encodeURIComponent(pathname)}` : ''
      router.replace(`/welcome${fromQuery}`)
      return
    }
    if (!roleAllowed) {
      router.replace('/unauthorized')
    }
  }, [isLoadingUser, isAuthenticated, user, roleAllowed, router, pathname])

  if (isLoadingUser || !isAuthenticated || !user || !roleAllowed) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground animate-pulse">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function RoleRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAppStore((s) => s.auth.isAuthenticated)
  const isLoadingUser = useAppStore((s) => s.auth.isLoadingUser)
  const user = useAppStore((s) => s.auth.user)
  const router = useRouter()
  const pathname = usePathname()

  const isAuthorized = Boolean(
    isAuthenticated && user && isRoleAllowed(user.role, allowedRoles)
  )

  useEffect(() => {
    if (isLoadingUser) return
    if (!isAuthenticated || !user) {
      const fromQuery = pathname ? `?from=${encodeURIComponent(pathname)}` : ''
      router.replace(`/welcome${fromQuery}`)
      return
    }
    if (!isAuthorized) {
      router.replace('/unauthorized')
    }
  }, [isLoadingUser, isAuthenticated, user, isAuthorized, router, pathname])

  if (isLoadingUser || !isAuthenticated || !user || !isAuthorized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground animate-pulse">Đang tải không gian làm việc...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
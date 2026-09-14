import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySession } from '@/lib/session'

const PUBLIC_PATHS = new Set(['/', '/login', '/bestellen', '/mijn-bestelling', '/design'])

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null

  if (pathname === '/login' && session) {
    const url = request.nextUrl.clone()
    url.pathname = session.role === 'COMM_POCKIES' ? '/' : `/sections/${session.huisgenotenSectionId}`
    return NextResponse.redirect(url)
  }

  if (!session) {
    if (PUBLIC_PATHS.has(pathname) || pathname.startsWith('/design/')) return NextResponse.next()
    const url = request.nextUrl.clone()
    url.pathname = '/bestellen'
    return NextResponse.redirect(url)
  }

  if (session.role === 'HUISGENOOT') {
    const ownSectionPath = `/sections/${session.huisgenotenSectionId}`
    const onOwnSection = pathname === ownSectionPath
    const onOverview = pathname === '/'
    const onOtherSection = pathname.startsWith('/sections/') && !onOwnSection
    const onAdmin = pathname.startsWith('/admin')

    if (onOverview || onOtherSection || onAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = ownSectionPath
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png).*)'],
}

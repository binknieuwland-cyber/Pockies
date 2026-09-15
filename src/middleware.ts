import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySession } from '@/lib/session'

const PUBLIC_PATHS = new Set(['/', '/login', '/bestellen', '/mijn-bestelling', '/design'])

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null

  if (pathname === '/login' && session) {
    const url = request.nextUrl.clone()
    url.pathname = session.role === 'COMM_POCKIES' ? '/' : '/mijn-overzicht'
    return NextResponse.redirect(url)
  }

  if (!session) {
    if (PUBLIC_PATHS.has(pathname) || pathname.startsWith('/design/')) return NextResponse.next()
    const url = request.nextUrl.clone()
    url.pathname = '/bestellen'
    return NextResponse.redirect(url)
  }

  if (session.role === 'HUISGENOOT') {
    const onOverview = pathname === '/'
    const onSections = pathname.startsWith('/sections/')
    const onAdmin = pathname.startsWith('/admin')

    if (onOverview || onSections || onAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/mijn-overzicht'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png).*)'],
}

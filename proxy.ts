import { NextResponse, type NextRequest } from 'next/server'

const ACCESS_COOKIE = 'bn_access'

export default async function proxy(request: NextRequest) {
  const accessKey = process.env.ACCESS_KEY

  // If no key is configured, don't lock everyone out of local dev.
  if (!accessKey) return NextResponse.next()

  if (request.cookies.get(ACCESS_COOKIE)?.value === 'granted') {
    return NextResponse.next()
  }

  if (request.nextUrl.searchParams.get('key') === accessKey) {
    const cleanUrl = new URL(request.nextUrl)
    cleanUrl.searchParams.delete('key')

    const response = NextResponse.redirect(cleanUrl)
    response.cookies.set(ACCESS_COOKIE, 'granted', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
    return response
  }

  return new NextResponse('Access denied', { status: 403 })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
}

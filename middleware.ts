import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // You can add route protection here if needed
  // For example, to protect admin routes:
  // if (req.nextUrl.pathname.startsWith('/admin')) {
  //   if (!session) {
  //     return NextResponse.redirect(new URL('/login', req.url))
  //   }
  //
  //   const { data: userRole } = await supabase
  //     .from('user_roles')
  //     .select('role')
  //     .eq('id', session.user.id)
  //     .single()
  //
  //   if (!userRole || userRole.role !== 'admin') {
  //     return NextResponse.redirect(new URL('/', req.url))
  //   }
  // }

  return res
}

// Specify which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

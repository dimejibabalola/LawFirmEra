import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /login (login page)
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
}

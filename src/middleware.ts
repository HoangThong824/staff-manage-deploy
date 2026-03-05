import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth/session";

// 1. Specify public routes
const publicRoutes = ["/login"];

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    // 2. Check if the current route is public
    const isPublicRoute = publicRoutes.includes(path);
    const isProtectedRoute = !isPublicRoute;

    // 3. Decrypt the session from the cookie
    const cookie = req.cookies.get("session")?.value;
    const session = cookie ? await decrypt(cookie).catch(() => null) : null;

    // 4. Redirect to /login if the user is not authenticated and trying to access a protected route
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // 5. Redirect to / if the user is authenticated and trying to access login/register
    if (
        isPublicRoute &&
        session &&
        !req.nextUrl.pathname.startsWith("/")
    ) {
        return NextResponse.redirect(new URL("/", req.nextUrl));
    }

    // Allow login/register to dashboard redirect if authenticated
    if (isPublicRoute && session) {
        return NextResponse.redirect(new URL("/", req.nextUrl));
    }

    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};

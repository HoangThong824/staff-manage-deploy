import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
    // Auth is handled client-side via LocalStorage and DataContext.
    // No server-side session checking needed.
    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};

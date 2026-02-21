import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Force redirect if role doesn't match path structure
        // e.g., student trying to access admin
        if (path.startsWith("/admin") && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/student/dashboard", req.url));
        }

        if (path.startsWith("/student") && token?.role !== "STUDENT" && token?.role !== "ALUMNI") {
            // Admin might want to see student view?
            if (token?.role === "ADMIN") return NextResponse.next();

            return NextResponse.redirect(new URL("/login", req.url));
        }

        if (path.startsWith("/alumni") && token?.role !== "ALUMNI") {
            if (token?.role === "ADMIN") return NextResponse.next();
            return NextResponse.redirect(new URL("/student/dashboard", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/student/:path*", "/alumni/:path*", "/admin/:path*"],
};

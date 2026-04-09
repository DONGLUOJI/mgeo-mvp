export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/ops/:path*",
    "/customers/:path*",
    "/leads/:path*",
    "/tasks/:path*",
    "/history/:path*",
    "/dashboard/:path*",
    "/deployment/:path*",
    "/api/system/:path*",
    "/api/leads/:path*",
    "/api/keywords/:path*",
    "/api/billing/:path*",
  ],
};

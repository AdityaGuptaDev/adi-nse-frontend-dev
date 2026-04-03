import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookieStorageKeys } from "./services/cookieStorageService";
import { getLS } from "./utils/helpers";
import { USER_DATA } from "./utils/constants";


const routes: any = {
  home: "/",
  login: "/login",
  // partnerOnboarding: "/partnerOnboarding",
  forgot: "/forgot-password",
  partnerDashboard: "/partner-dashboard",
  register: "/register",

  investorDashboard: "/dashboards",
  adminDashboard: "/admin-dashboard",
  rmDashboard: "/rm-dashboard",

};

// Public routes that logged-in users should not access
const restrictedPublicRoutes = [
  routes.login,
  routes.forgot,
  routes.partnerOnboarding,
  routes.register
];

// Dashboard routes that should be allowed for logged-in users
const allowedDashboardRoutes = [
  routes.dashboard,
  routes.investorDashboard,
  routes.adminDashboard,
  routes.partnerDashboard,
  routes.rmDashboard,
];

// Helper function to get the appropriate dashboard for logged-in users
function getRedirectPath(initPath: string | undefined): string {

  // Check if initPath exists and is valid (not empty, null, undefined)
  if (initPath && initPath !== 'undefined' && initPath !== 'null' && initPath.trim() !== '') {
    let cleanPath = initPath;

    // Try to parse JSON if it looks like JSON, otherwise use as string
    if (initPath.startsWith('"') && initPath.endsWith('"')) {
      cleanPath = JSON.parse(initPath);
    }
    else {
      cleanPath = initPath;
    }

    // Ensure path starts with '/' for consistency
    if (cleanPath && !cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }

    // Make sure initPath is not a restricted public route to avoid redirect loops
    const isRestrictedRoute = restrictedPublicRoutes.some(route => cleanPath.startsWith(route));
    const isDashboardRoute = allowedDashboardRoutes.some(route => cleanPath === route);



    // Allow any dashboard-like route that's not restricted
    if (!isRestrictedRoute && (isDashboardRoute || cleanPath.startsWith('/admin') || cleanPath.startsWith('/rm') || cleanPath.startsWith('/partner') || cleanPath.startsWith('/investor') || cleanPath.startsWith('/dashboard'))) {
      return cleanPath;
    }
  }

  // Fallback to default dashboard
  return routes.dashboard;
}


// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {


  let initPath: any = req.cookies.get(cookieStorageKeys.INIT_PATH)?.value;


  let token = req.cookies.get(cookieStorageKeys.TOKEN)?.value;

  const { pathname } = req.nextUrl;


  if (token) {
    // Check if logged-in user is trying to access restricted public routes
    const isAccessingRestrictedRoute = restrictedPublicRoutes.some(route => pathname.startsWith(route));

    // Special handling for home route - redirect to dashboard only if user has a valid initPath
    if (pathname === routes.home) {
      const redirectPath = getRedirectPath(initPath);

      // Only redirect if we have a valid initPath or if redirect path is not the default fallback
      if (initPath && initPath !== 'undefined' && initPath !== 'null' && initPath.trim() !== '') {
        return NextResponse.redirect(new URL(redirectPath, req.url));
      }
      // If no valid initPath, allow access to home page
      return NextResponse.next();
    }

    if (isAccessingRestrictedRoute) {
      const redirectPath = getRedirectPath(initPath);
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }

    return NextResponse.next(); // Allow normal request for authenticated users
  }
  // If NOT logged in and trying to access anything other than public routes, redirect to landing
  if (!(pathname.startsWith(routes.login) || pathname.startsWith(routes.forgot) || pathname.startsWith(routes.home) || pathname.startsWith(routes.partnerOnboarding) || pathname.startsWith(routes.register))) {
    return NextResponse.redirect(new URL(routes.home, req.url));
  }

  return NextResponse.next();
}

export const config = {
  // matcher: "/((?!api|static|.*\\..*|_next).*)",
  matcher: ["/((?!api|_next|.*\\..*).*)"], // match all non-static, non-API routes
};

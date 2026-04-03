import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // try {
  //   const token = req.headers.get("Authorization")?.split("Bearer ")[1];
  //   console.log("TOKENNNNNNNNNN", token);
    

  //   if (!token) {
  //     throw "Invalid token";
  //   }

  //   const payload = await verifiyToken(token);
  //   if (!payload) {
  //     throw "Invalid token";
  //   }
  //   req.nextUrl.searchParams.set("user", JSON.stringify(payload));
  //   return NextResponse.next();
  // } catch (error) {
  //   console.error("Error verifying JWT:", error);
  //   return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  // }
}

export const config = {
  matcher: "/api/:path*", // Apply middleware to all API routes
};
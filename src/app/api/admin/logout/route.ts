import { cookies } from "next/headers";
import { COOKIE } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) return new Response(null, { status: 403 });
  (await cookies()).delete(COOKIE);
  return Response.redirect(new URL("/admin/login", request.url), 303);
}

import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { COOKIE, verifySession } from "./admin-auth";

// Second lock after proxy.ts. Every admin page and every admin Server Action calls one of these itself,
// because actions can be reached by a direct POST.
export async function isAdmin() {
  // The session check reads the clock, so it must never run during a prerender.
  await connection();
  return verifySession((await cookies()).get(COOKIE)?.value);
}

export async function requireAdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function requireAdminAction() {
  if (!(await isAdmin())) throw new Error("Sua sessão expirou. Entre de novo.");
}

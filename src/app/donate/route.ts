import { settingsRedirect } from "@/lib/redirect-link";

export async function GET(request: Request) {
  return settingsRedirect(request, "donate");
}

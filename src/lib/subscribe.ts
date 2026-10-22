// Client-side helper shared by every form on the site. Posts to /api/subscribe, which stores the row in Supabase.
export type Signup = {
  kind: "download" | "waitlist" | "newsletter";
  email: string;
  first_name?: string;
  state?: string;
  book?: string;
  prayer_request?: string;
  email_reminders?: boolean;
  share_request?: boolean;
  source?: string;
  heard_from?: string;
  heart_topic?: string;
  age_range?: string;
  company?: string; // honeypot: real people never fill it
};

export async function subscribe(data: Signup) {
  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

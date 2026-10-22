// US holidays and Christian observances used by the posting plan in /admin/social. Dates are plain "YYYY-MM-DD" keys.

const pad = (n: number) => String(n).padStart(2, "0");
const key = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

export const parseKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return utc(y, m, d);
};
export const shiftKey = (k: string, days: number) => key(addDays(parseKey(k), days));
export const weekday = (k: string) => parseKey(k).getUTCDay(); // 0 = Sunday
export const dayNumber = (k: string) => Math.floor(parseKey(k).getTime() / 86_400_000);
export const weekNumber = (k: string) => Math.floor((dayNumber(k) + 4) / 7); // weeks start on Sunday

// nth weekday of a month (n = -1 for the last one). weekdayIndex: 0 = Sunday.
function nthWeekday(y: number, m: number, weekdayIndex: number, n: number) {
  if (n > 0) {
    const first = utc(y, m, 1);
    return addDays(first, ((weekdayIndex - first.getUTCDay() + 7) % 7) + (n - 1) * 7);
  }
  const last = utc(y, m + 1, 0);
  return addDays(last, -((last.getUTCDay() - weekdayIndex + 7) % 7));
}

// Western (Gregorian) Easter Sunday, anonymous Gregorian algorithm.
function easter(y: number) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return utc(y, month, day);
}

export type HolidayKey =
  | "new-year" | "mlk-day" | "valentines" | "ash-wednesday" | "palm-sunday" | "good-friday" | "easter"
  | "day-of-prayer" | "mothers-day" | "memorial-day" | "pentecost" | "fathers-day" | "independence-day"
  | "back-to-school" | "labor-day" | "grandparents-day" | "patriot-day" | "pastor-appreciation"
  | "veterans-day" | "thanksgiving" | "advent" | "christmas-eve" | "christmas" | "new-years-eve";

export function holidaysOf(y: number): { key: HolidayKey; date: string }[] {
  const e = easter(y);
  const labor = nthWeekday(y, 9, 1, 1);
  const christmas = utc(y, 12, 25);
  const list: [HolidayKey, Date][] = [
    ["new-year", utc(y, 1, 1)],
    ["mlk-day", nthWeekday(y, 1, 1, 3)],
    ["valentines", utc(y, 2, 14)],
    ["ash-wednesday", addDays(e, -46)],
    ["palm-sunday", addDays(e, -7)],
    ["good-friday", addDays(e, -2)],
    ["easter", e],
    ["day-of-prayer", nthWeekday(y, 5, 4, 1)],
    ["mothers-day", nthWeekday(y, 5, 0, 2)],
    ["memorial-day", nthWeekday(y, 5, 1, -1)],
    ["pentecost", addDays(e, 49)],
    ["fathers-day", nthWeekday(y, 6, 0, 3)],
    ["independence-day", utc(y, 7, 4)],
    ["back-to-school", nthWeekday(y, 8, 1, 3)],
    ["labor-day", labor],
    ["grandparents-day", addDays(labor, 6)],
    ["patriot-day", utc(y, 9, 11)],
    ["pastor-appreciation", nthWeekday(y, 10, 0, 2)],
    ["veterans-day", utc(y, 11, 11)],
    ["thanksgiving", nthWeekday(y, 11, 4, 4)],
    ["advent", addDays(christmas, -(christmas.getUTCDay() || 7) - 21)],
    ["christmas-eve", utc(y, 12, 24)],
    ["christmas", christmas],
    ["new-years-eve", utc(y, 12, 31)],
  ];
  return list.map(([k, d]) => ({ key: k, date: key(d) })).sort((a, b) => a.date.localeCompare(b.date));
}

export function holidayOn(date: string) {
  return holidaysOf(Number(date.slice(0, 4))).find((h) => h.date === date)?.key;
}

// Holidays from `date` (inclusive) up to `days` ahead.
export function upcomingHolidays(date: string, days: number) {
  const y = Number(date.slice(0, 4));
  const end = shiftKey(date, days);
  return [...holidaysOf(y), ...holidaysOf(y + 1)].filter((h) => h.date >= date && h.date <= end);
}

// "07:30" in New York on `date`, shown in Brasília time (the owner posts from Brazil).
export function etToBrt(date: string, time: string) {
  const [h, m] = time.split(":").map(Number);
  const [y, mo, d] = date.split("-").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, m);
  // Shift by New York's UTC offset on that day (handles daylight saving time).
  const ny = new Date(new Date(guess).toLocaleString("en-US", { timeZone: "America/New_York" }));
  const utcView = new Date(new Date(guess).toLocaleString("en-US", { timeZone: "UTC" }));
  const instant = new Date(guess + (utcView.getTime() - ny.getTime()));
  return instant.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
}

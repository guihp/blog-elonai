import QRCode from "qrcode";
import { cacheTag } from "next/cache";
import { getSettings, SETTINGS_TAG } from "./settings";

export async function qrSvg(url: string) {
  "use cache";
  return QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#4a3a24", light: "#0000" } });
}

// The QR code is always drawn from the saved link itself, so it can never point somewhere different from the button.
export async function donateOptions() {
  "use cache";
  cacheTag(SETTINGS_TAG);
  const { donation_methods } = await getSettings();
  return Promise.all(donation_methods.map(async (m) => ({ ...m, qr: await qrSvg(m.url) })));
}

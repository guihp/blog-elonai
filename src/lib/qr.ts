import QRCode from "qrcode";
import { donationMethods } from "./donation";

export async function qrSvg(url: string) {
  "use cache";
  return QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#4a3a24", light: "#0000" } });
}

export async function donateOptions() {
  "use cache";
  return Promise.all(donationMethods.map(async (m) => ({ ...m, qr: await qrSvg(m.url) })));
}

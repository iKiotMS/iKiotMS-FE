import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Reuse the app across HMR reloads / multiple imports.
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

/**
 * When true, the signup flow skips Firebase OTP entirely and sends the
 * backend's dev-bypass sentinel token instead. Set NEXT_PUBLIC_OTP_BYPASS=true
 * in .env.local for local development so no real SMS is sent.
 */
export const OTP_BYPASS = process.env.NEXT_PUBLIC_OTP_BYPASS === "true";

/** Normalize a Vietnamese phone number to E.164 (+84...) for Firebase. */
export function toE164(phone: string): string {
  const p = phone.trim().replace(/[\s\-().]/g, "");
  if (p.startsWith("+")) return p;
  if (p.startsWith("84")) return "+" + p;
  if (p.startsWith("0")) return "+84" + p.slice(1);
  return "+84" + p;
}

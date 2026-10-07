// Remembers a completed admin 2-step check on this browser for a limited time,
// so admins are not asked again on every new tab, refresh or return visit.
// This only controls the extra screen; real admin access is enforced by database roles.
const KEY = "admin_otp_verified_v2";
const TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export const isAdminOtpVerified = (userId?: string | null) => {
  if (!userId) return false;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const { uid, exp } = JSON.parse(raw);
    return uid === userId && typeof exp === "number" && exp > Date.now();
  } catch { return false; }
};

export const markAdminOtpVerified = (userId?: string | null) => {
  if (!userId) return;
  localStorage.setItem(KEY, JSON.stringify({ uid: userId, exp: Date.now() + TTL_MS }));
  sessionStorage.removeItem("admin_otp_sent");
};

export const clearAdminOtp = () => {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem("admin_otp_sent");
  sessionStorage.removeItem("admin_otp_verified");
};

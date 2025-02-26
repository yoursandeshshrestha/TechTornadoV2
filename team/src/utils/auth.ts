// utils/auth.ts

/**
 * Set token in cookie
 * @param token JWT token to store
 * @param expiryDays Number of days until token expires
 */
export const setTokenCookie = (token: string, expiryDays = 1) => {
  if (typeof document === "undefined") return;

  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + expiryDays * 24 * 60 * 60 * 1000);

  document.cookie = `token=${token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict`;
};

/**
 * Get token from cookie
 * @returns token or null if not found
 */
export const getTokenFromCookie = (): string | null => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("token=")
  );
  return tokenCookie ? tokenCookie.split("=")[1] : null;
};

/**
 * Remove token from cookie (logout)
 */
export const removeTokenCookie = () => {
  if (typeof document === "undefined") return;

  document.cookie =
    "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";

  // Also clear any team data from localStorage
  localStorage.removeItem("team");
};

/**
 * Save team info to localStorage
 * @param teamData Team information to store
 */
export const saveTeamInfo = (teamData: any) => {
  if (typeof localStorage === "undefined") return;

  localStorage.setItem(
    "team",
    JSON.stringify({
      ...teamData,
      isLoggedIn: true,
    })
  );
};

/**
 * Get team info from localStorage
 * @returns Team information or null if not found
 */
export const getTeamInfo = () => {
  if (typeof localStorage === "undefined") return null;

  const teamData = localStorage.getItem("team");
  if (!teamData) return null;

  try {
    return JSON.parse(teamData);
  } catch (e) {
    console.error("Failed to parse team data", e);
    return null;
  }
};

/**
 * Check if user is authenticated by verifying token existence
 * @returns boolean indicating if authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getTokenFromCookie();
  return !!token;
};

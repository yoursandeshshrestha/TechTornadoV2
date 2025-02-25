export const getTokenFromCookie = () => {
  if (typeof document === "undefined") return null; // Ensure it's running in the browser

  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("token=")
  );
  return tokenCookie ? tokenCookie.split("=")[1] : null;
};

export const getTokenFromCookie = () => {
  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("token=")
  );
  return tokenCookie ? tokenCookie.split("=")[1] : null;
};

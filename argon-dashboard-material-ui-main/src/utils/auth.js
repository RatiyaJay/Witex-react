export function getToken() {
  try {
    return localStorage.getItem("witex_token") || "";
  } catch (_) {
    return "";
  }
}

export function setToken(token) {
  try {
    localStorage.setItem("witex_token", token);
  } catch (_) {}
}

export function clearToken() {
  try {
    localStorage.removeItem("witex_token");
  } catch (_) {}
}

export function decodeJwt(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (_) {
    return null;
  }
}

export function getUser() {
  const token = getToken();
  const payload = decodeJwt(token);
  if (!payload) return null;
  return { id: payload.id, email: payload.email, role: payload.role };
}

export function isSuperAdmin() {
  const u = getUser();
  return !!u && (u.role === "super_admin" || u.role === "SUPER_ADMIN");
}

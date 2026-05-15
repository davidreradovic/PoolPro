const API = "http://localhost:8080/api";

export async function apiFetch(path, options = {}, token) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

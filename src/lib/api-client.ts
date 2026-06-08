export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("token");
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "An error occurred while fetching data");
  }

  const json = await response.json();

  // If the API wrapped the response in { success: true, ...rest }, return the rest
  if (json && typeof json === "object" && "success" in json) {
    const { success, error, message, ...rest } = json;
    // If there's a nested data property and it's the ONLY property besides pagination etc, 
    // we should be careful. Actually, the backend sends { success: true, data: [...], pagination: {...} }
    // or { success: true, data: {...} } for single items.
    // If there's a pagination object, we must return { data: rest.data, pagination: rest.pagination }.
    // So returning `rest` directly is perfect because it contains `data` and `pagination`.
    // Wait, some components might just expect the raw data if it's just { success: true, data: {...} }
    // Let's check: if there's ONLY a 'data' key in rest, we return rest.data. Otherwise, return rest.
    const keys = Object.keys(rest);
    if (keys.length === 1 && keys[0] === "data") {
      return rest.data;
    }
    return rest as T;
  }

  return json as T;
}

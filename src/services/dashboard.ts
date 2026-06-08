import { fetchApi } from "../lib/api-client";

export async function getDashboardStats() {
  return fetchApi<any>("/dashboard");
}

import { fetchApi } from "../lib/api-client";

export async function getAnalytics() {
  return fetchApi<any>("/analytics");
}

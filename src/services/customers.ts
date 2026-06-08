import { fetchApi } from "../lib/api-client";

export async function getCustomers(params: Record<string, any> = {}) {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return fetchApi<any>(`/customers?${query}`);
}

export async function getCustomer(id: string) {
  return fetchApi<any>(`/customers/${id}`);
}

import { fetchApi } from "../lib/api-client";

export async function getTickets(params: Record<string, any> = {}) {
  // Filter out undefined/null/empty values to prevent "undefined" strings
  // from being sent to the backend and failing Zod validation
  const cleaned: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = String(value);
    }
  }
  const query = new URLSearchParams(cleaned).toString();
  return fetchApi<any>(`/tickets?${query}`);
}

export async function getTicket(id: string) {
  return fetchApi<any>(`/tickets/${id}`);
}

export async function createTicket(data: any) {
  return fetchApi<any>("/tickets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTicket(id: string, data: any) {
  return fetchApi<any>(`/tickets/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTicket(id: string) {
  return fetchApi<any>(`/tickets/${id}`, {
    method: "DELETE",
  });
}

export async function addNote(ticketId: string, data: any) {
  return fetchApi<any>(`/tickets/${ticketId}/notes`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

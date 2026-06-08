import { useQuery } from "@tanstack/react-query";
import { getCustomers, getCustomer } from "../services/customers";

export function useCustomers(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => getCustomers(params),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });
}

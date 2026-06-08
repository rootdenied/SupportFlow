import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "../services/analytics";

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: getAnalytics,
  });
}

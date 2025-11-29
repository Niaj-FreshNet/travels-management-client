import { useQuery } from "@tanstack/react-query";
import useAxiosUser from "./useAxiosUser";

const useAirlines = (page = 1, limit = 100) => {
  const axiosUser = useAxiosUser();

  const {
    data,
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["airlines", page, limit],
    queryFn: async () => {
      const res = await axiosUser.get(`/airlines?page=${page}&limit=${limit}`);
      // Assuming res.data has structure: { success, data: { data: [...], pagination: {...} } }
      return res.data.data;
    },
    keepPreviousData: true,
  });

  return {
    airlines: data?.data || [],
    pagination: data?.pagination || { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    refetch,
    isLoading,
    isError,
    error,
  };
};

export default useAirlines;

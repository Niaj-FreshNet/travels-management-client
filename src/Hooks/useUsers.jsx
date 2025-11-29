import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const useUsers = (page = 1, limit = 100) => {
  const axiosSecure = useAxiosSecure();

  const {
    data,
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["users", page, limit],
    queryFn: async () => {
      const res = await axiosSecure.get(`/user/office?page=${page}&limit=${limit}`);
      // Assuming res.data has structure: { success, data: { data: [...], pagination: {...} } }
      return res.data.data;
    },
    keepPreviousData: true,
  });

  return {
    // users: data?.data || [],
    users: data || [],
    pagination: data?.pagination || { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    refetch,
    isLoading,
    isError,
    error,
  };
};

export default useUsers;

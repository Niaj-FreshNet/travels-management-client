import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const useAllUsers = (page = 1, limit = 100) => {
  const axiosSecure = useAxiosSecure();

  const {
    data,
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["allUsers", page, limit],
    queryFn: async () => {
      const res = await axiosSecure.get(`/user/all?page=${page}&limit=${limit}`);
      // Assuming res.data has structure: { success, data: { data: [...], pagination: {...} } }
      return res.data.data;
    },
    keepPreviousData: true,
  });

  return {
    // allUsers: data?.data || [],
    allUsers: data || [],
    pagination: data?.pagination || { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    refetch,
    isLoading,
    isError,
    error,
  };
};

export default useAllUsers;

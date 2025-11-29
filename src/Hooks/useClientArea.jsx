import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const useClientArea = (page = 1, limit = 20) => {
  const axiosSecure = useAxiosSecure();

  const {
    data,
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['clientArea', page, limit],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/clientArea?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    keepPreviousData: true,
    enabled: !!page && !!limit, // only fetch if page and limit exist
  });

  return {
    clientArea: data?.data.data || [],
    pagination: data?.pagination || {
      page,
      limit,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    refetch,
    isLoading,
    isError,
    error,
  };
};

export default useClientArea;

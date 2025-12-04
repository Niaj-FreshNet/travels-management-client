import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const useSales = (page, limit, queryParams) => {
  const axiosSecure = useAxiosSecure();

  const queryString = new URLSearchParams({
    ...queryParams,
    page,
    limit,
  }).toString();

  const {
    data,
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["sales", page, limit, queryParams],
    queryFn: async () => {
      const res = await axiosSecure.get(`/sales?${queryString}`);
      return res.data.data;
    },
    keepPreviousData: true,
    enabled: !!page && !!limit, // only fetch if both exist
  });

  return {
    sales: data?.data || [],
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

export default useSales;

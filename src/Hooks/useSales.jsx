import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const useSales = (page, limit, search) => {
  const axiosSecure = useAxiosSecure();

  const {
    data,
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["sales", page, limit, search || ""],
    queryFn: async () => {
      const res = await axiosSecure.get(`/sales?page=${page}&limit=${limit}&search=${search}`);
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

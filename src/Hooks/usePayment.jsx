import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const usePayment = (page = 1, limit = 20) => {
  const axiosSecure = useAxiosSecure();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['payment', page, limit],
    queryFn: async () => {
      const res = await axiosSecure.get(`/payment?page=${page}&limit=${limit}`);
      console.log(res);
      return res.data?.data;
    },
    keepPreviousData: true
  });

  return {
    payments: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    totalPages: data?.totalPages || 1,
    isLoading,
    isError,
    error,
    refetch
  };
};

export default usePayment;

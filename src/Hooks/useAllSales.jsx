import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const useAllSales = () => {
  const axiosSecure = useAxiosSecure();
  const { refetch, data: allSales = [], isLoading, isError, error } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const res = await axiosSecure.get('/all-sales');
      return res.data;
    }
  });

  return { allSales, refetch, isLoading, isError, error };
};

export default useAllSales;

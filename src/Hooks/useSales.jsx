import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const useSales = () => {
  const axiosSecure = useAxiosSecure();
  const { refetch, data: sales = [], isLoading, isError, error } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const res = await axiosSecure.get('/sales');
      return res.data;
    }
  });

  return { sales, refetch, isLoading, isError, error };
};

export default useSales;

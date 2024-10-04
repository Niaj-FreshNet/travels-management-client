import { useQuery } from "@tanstack/react-query";
import useAxiosUser from "./useAxiosUser";

const useSales = () => {
  const axiosUser = useAxiosUser();
  const { refetch, data: sales = [], isLoading, isError, error } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const res = await axiosUser.get('/sales');
      return res.data;
    }
  });

  return { sales, refetch, isLoading, isError, error };
};

export default useSales;

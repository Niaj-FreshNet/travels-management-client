import { useQuery } from "@tanstack/react-query";
import useAxiosUser from "./useAxiosUser";

const usePayment = () => {
  const axiosUser = useAxiosUser();
  const { refetch, data: payment = [], isLoading, isError, error } = useQuery({
    queryKey: ['payment'],
    queryFn: async () => {
      const res = await axiosUser.get('/payment');
      return res.data;
    }
  });

  return { payment, refetch, isLoading, isError, error };
};

export default usePayment;

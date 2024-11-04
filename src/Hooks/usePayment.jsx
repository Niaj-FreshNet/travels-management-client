import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const usePayment = () => {
  const axiosSecure = useAxiosSecure();
  const { refetch, data: payment = [], isLoading, isError, error } = useQuery({
    queryKey: ['payment'],
    queryFn: async () => {
      const res = await axiosSecure.get('/payment');
      return res.data;
    }
  });

  return { payment, refetch, isLoading, isError, error };
};

export default usePayment;

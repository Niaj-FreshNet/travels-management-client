import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const useSuppliers = () => {
  const axiosSecure = useAxiosSecure();
  const { refetch, data: suppliers = [], isLoading, isError, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const res = await axiosSecure.get('/suppliers');
      return res.data;
    }
  });

  return { suppliers, refetch, isLoading, isError, error };
};

export default useSuppliers;

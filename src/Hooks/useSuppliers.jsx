import { useQuery } from "@tanstack/react-query";
import useAxiosUser from "./useAxiosUser";

const useSuppliers = () => {
  const axiosUser = useAxiosUser();
  const { refetch, data: suppliers = [], isLoading, isError, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const res = await axiosUser.get('/suppliers');
      return res.data;
    }
  });

  return { suppliers, refetch, isLoading, isError, error };
};

export default useSuppliers;

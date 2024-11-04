import { useQuery } from "@tanstack/react-query";
import useAxiosUser from "./useAxiosUser";
import useAxiosSecure from "./useAxiosSecure";

const useClientArea = () => {
  const axiosSecure = useAxiosSecure();
  const { refetch, data: clientArea = [], isLoading, isError, error } = useQuery({
    queryKey: ['clientArea'],
    queryFn: async () => {
      const res = await axiosSecure.get('/clientArea');
      return res.data;
    }
  });

  return { clientArea, refetch, isLoading, isError, error };
};

export default useClientArea;

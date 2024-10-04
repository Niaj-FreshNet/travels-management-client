import { useQuery } from "@tanstack/react-query";
import useAxiosUser from "./useAxiosUser";

const useAirlines = () => {
  const axiosUser = useAxiosUser();
  const { refetch, data: airlines = [], isLoading, isError, error } = useQuery({
    queryKey: ['airlines'],
    queryFn: async () => {
      const res = await axiosUser.get('/airlines');
      return res.data;
    }
  });

  return { airlines, refetch, isLoading, isError, error };
};

export default useAirlines;

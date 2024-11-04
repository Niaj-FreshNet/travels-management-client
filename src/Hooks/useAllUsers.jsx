import { useQuery } from "@tanstack/react-query";
import useAxiosUser from "./useAxiosUser";
import useAxiosSecure from "./useAxiosSecure";

const useAllUsers = () => {
  const axiosSecure = useAxiosSecure();
  const { refetch, data: allUsers = [], isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axiosSecure.get('/all-users');
      return res.data;
    }
  });

  return { allUsers, refetch, isLoading, isError, error };
};

export default useAllUsers;

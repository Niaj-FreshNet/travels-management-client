import { useQuery } from "@tanstack/react-query";
import useAxiosUser from "./useAxiosUser";
import useAxiosSecure from "./useAxiosSecure";

const useUsers = () => {
  const axiosSecure = useAxiosSecure();
  const { refetch, data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axiosSecure.get('/users/office');
      return res.data;
    }
  });

  return { users, refetch, isLoading, isError, error };
};

export default useUsers;

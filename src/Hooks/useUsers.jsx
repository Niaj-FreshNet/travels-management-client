import { useQuery } from "@tanstack/react-query";
import useAxiosUser from "./useAxiosUser";

const useUsers = () => {
  const axiosUser = useAxiosUser();
  const { refetch, data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axiosUser.get('/users');
      return res.data;
    }
  });

  return { users, refetch, isLoading, isError, error };
};

export default useUsers;

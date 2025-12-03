import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const useMe = () => {
  const axiosSecure = useAxiosSecure();

  const {
    data,
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/user`);
      return res.data.data;
    },
    keepPreviousData: true,
  });

  return {
    // users: data?.data || [],
    user: data || [],
    pagination: data?.pagination,
    refetch,
    isLoading,
    isError,
    error,
  };
};

export default useMe;

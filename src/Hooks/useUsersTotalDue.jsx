import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const useUsersTotalDue = () => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["usersTotalDue"],
    queryFn: async () => {
      const res = await axiosSecure.get("/sales/total-due");
      return res.data.data; // [{ name, totalDue }, ...]
    },
    staleTime: 1000 * 60, // optional: cache for 1 minute
  });
};

export default useUsersTotalDue;

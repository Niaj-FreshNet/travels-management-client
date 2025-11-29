import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const useProfitSummary = () => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["profitSummary"],
    queryFn: async () => {
      const res = await axiosSecure.get("/sales/profit-summary");
      return res.data.data; // { totalProfit, profitOnAir }
    }
  });
};

export default useProfitSummary;

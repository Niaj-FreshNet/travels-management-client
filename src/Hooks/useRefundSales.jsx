import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const useRefundSales = (page, limit, search = "") => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["refundSales", page, limit, search],
    queryFn: async () => {
      const params = { page, limit, search };
      const res = await axiosSecure.get("/sales/refunds", { params });
      return res.data?.data;  // expecting { data, pagination }
    },
    keepPreviousData: true,
  });
};

export default useRefundSales;

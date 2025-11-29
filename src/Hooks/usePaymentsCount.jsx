import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const usePaymentCounts = () => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["paymentCounts"],
    queryFn: async () => {
      const res = await axiosSecure.get("/sales/payment-status-count");
      return res.data.data;
    }
  });
};

export default usePaymentCounts;

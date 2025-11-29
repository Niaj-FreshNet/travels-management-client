import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useIsActive = () => {
    const { user } = useAuth();  // Get the logged-in user's info
    const axiosSecure = useAxiosSecure();  // Secure Axios instance

    // Fetch the user's active status using react-query
    const { data: isActive, isLoading: isActiveLoading } = useQuery({
        queryKey: [user?.email, 'isActive'],
        queryFn: async () => {
            if (!user?.email) return false;  // Return false if there's no user logged in
            const res = await axiosSecure.get(`/user/status/${user.email}`);
            return res.data?.active;  // Return the active status
        },
        enabled: !!user?.email  // Only run the query if the user is logged in
    });

    return [isActive, isActiveLoading];
};

export default useIsActive;

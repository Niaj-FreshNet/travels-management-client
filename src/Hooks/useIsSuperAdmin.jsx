import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useIsSuperAdmin = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: isSuperAdmin, isLoading: isSuperAdminLoading } = useQuery({
        queryKey: [user?.email, 'isSuperAdmin'],
        queryFn: async () => {
            const res = await axiosSecure.get(`/users/super-admin/${user.email}`);
            // console.log(res.data)
            return res.data?.isSuperAdmin;
        },
        enabled: !!user?.email, // Ensure query only runs if email exists
    });

    return [isSuperAdmin, isSuperAdminLoading];
};

export default useIsSuperAdmin;
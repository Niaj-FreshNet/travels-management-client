import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useUsers from "./useUsers"; // Import useUsers
import useAxiosSecure from "./useAxiosSecure";

const useAdmin = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: isAdmin, isPending: isAdminLoading } = useQuery({
        queryKey: [user?.email, 'isAdmin'],
        queryFn: async () => {
            const res = await axiosSecure.get(`/users/admin/${user.email}`);
            // IN THE SERVER WE'VE ACCESSED BOTH ADMIN AND SUPER-ADMIN USER FOR "ISADMIN = TRUE"  
            console.log(res.data)
            return res.data?.admin;
        }
    })

    return [isAdmin, isAdminLoading];
};

export default useAdmin;

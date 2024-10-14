import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useUsers from "./useUsers"; // Import useUsers
import useAxiosSecure from "./useAxiosSecure";

const useAdmin = () => {
    const { user } = useAuth();
    const { users, isLoading: isUsersLoading } = useUsers(); // Get users and loading state

    // Check if the user is an admin based on their role
    const isAdmin = users.some((u) => u.email === user?.email && u.role === 'Admin');
    
    // Set loading state based on users loading state
    const isAdminLoading = isUsersLoading;

    return [isAdmin, isAdminLoading];
};

export default useAdmin;

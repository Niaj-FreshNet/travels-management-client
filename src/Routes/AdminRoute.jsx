import { useLocation, useNavigate } from "react-router-dom";
import useAdmin from "../Hooks/useAdmin";
import useAuth from "../Hooks/useAuth";
import { useEffect } from "react";
import { Spin } from "antd";

const AdminRoute = ({ children }) => {
    console.log('AdminRoute component called'); // Top-level log

    const { user, loading } = useAuth();
    const [isAdmin, isAdminLoading] = useAdmin();
    const location = useLocation();
    const navigate = useNavigate();

    console.log('User:', user); // Log user details
    console.log('Loading:', loading); // Log loading state
    console.log('isAdmin:', isAdmin); // Log isAdmin status
    console.log('isAdminLoading:', isAdminLoading); // Log isAdminLoading state

    useEffect(() => {
        if (!loading && !isAdminLoading) {
            if (!user || !isAdmin) {
                console.log('Navigating to home page'); // Log before navigation
                navigate('/', { state: { from: location }, replace: true });
            }
        }
    }, [loading, isAdminLoading, user, isAdmin, navigate, location]);

    if (loading || isAdminLoading) {
        return <Spin />;
    }

    if (user && isAdmin) {
        return children;
    }

    return <div>Access Denied</div>; // Add boundary component
};

export default AdminRoute;

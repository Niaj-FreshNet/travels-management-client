import React, { useContext } from 'react';
import { Button, Result, Spin } from 'antd';  // Ant Design components
import { FrownOutlined } from '@ant-design/icons'; // Ant Design icons
import { useNavigate } from 'react-router-dom';
import useIsActive from '../Hooks/useIsActive';  // Custom hook to check if user is active
import './InactiveUserStyle.css'
import { AuthContext } from '../providers/AuthProvider';
import useAuth from '../Hooks/useAuth';

const InactiveUser = ({ children }) => {
    const { logOut } = useAuth();
    const [isActive, isActiveLoading] = useIsActive();  // Hook for checking account status
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logOut();
        // Clear the access token or any other user-related data
        localStorage.removeItem('access-token');
        navigate('/login');  // Redirect to login after logout
    };

    // Show a loading spinner while account status is being checked
    if (isActiveLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Checking account status..." />
            </div>
        );
    }

    // If the account is inactive, display the inactive message
    if (!isActive) {
        return (
            <div className="inactive-user-container">
                <Result
                    icon={<FrownOutlined />}
                    status="warning"
                    title="Your Account is Inactive"
                    subTitle="It looks like your account is currently inactive. Please contact support if you think this is a mistake."
                    extra={
                        <div className="inactive-user-actions">
                            <Button type="primary" onClick={handleLogout}>
                                Log Out
                            </Button>
                            {/* <Button type="link" onClick={() => navigate('/contact')}> */}
                            <a href='/'>
                                Contact Support
                            </a>
                        </div>
                    }
                />
            </div>
        );
    }

    // If the account is active, render the rest of the app (children)
    return <>{children}</>;
};

export default InactiveUser;
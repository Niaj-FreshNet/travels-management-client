import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../Hooks/useAuth';
import { Spin } from 'antd';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setIsRedirecting(true);
      const timer = setTimeout(() => {
        navigate('/login');
      }, 500); // Adjust the delay as needed

      return () => clearTimeout(timer);
    }
  }, [loading, user, navigate]);

  if (loading || isRedirecting) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return user ? children : null;
};

export default PrivateRoute;

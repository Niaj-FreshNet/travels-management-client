import React from 'react';
import { Button, Card } from 'antd';
import { CrownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const SuperAdminCard = () => {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/clientArea'); // Redirect to the AllClientArea component route
    };
    return (
        <Card
            className="my-4 shadow-lg animate__animated animate__fadeIn"
            style={{
                background: 'linear-gradient(135deg, #f0f5ff 30%, #e6f7ff 70%)',
                border: '1px solid #91d5ff',
                borderRadius: '15px',
                textAlign: 'center',
                padding: '30px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.2 }}>
                <CrownOutlined style={{ fontSize: '200px', color: '#faad14' }} />
            </div>
            <CrownOutlined style={{ fontSize: '50px', color: '#faad14' }} />
            <h3 className="text-3xl font-extrabold mt-3" style={{ color: '#1a1a1a' }}>
                Super Admin Privileges
            </h3>
            <p className="text-lg mt-2" style={{ color: '#595959', fontStyle: 'italic' }}>
            You hold the highest authority! Manage client areas, monitor sales, and oversee user activities across the platform. Your role is essential for maintaining control and ensuring smooth operations.
            </p>
            <Button
                onClick={handleButtonClick} // Use the navigate function on click
                style={{
                    marginTop: '20px',
                    padding: '12px 30px',
                    backgroundColor: '#faad14',
                    color: '#fff',
                    borderRadius: '25px',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                    border: 'none',
                    letterSpacing: '1px',
                    textAlign: 'center',
                }}
                className="hover:transform hover:scale-105 hover:shadow-lg hover:bg-[#d48806]"
            >
                Explore ClientArea
            </Button>
        </Card>
    );
};

export default SuperAdminCard;
import React, { useState } from 'react';
import { Card, Typography, Spin, Avatar, Input } from 'antd';
import { UserOutlined, MailOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import useAuth from '../../Hooks/useAuth';
import useUsers from '../../Hooks/useUsers';
import 'tailwindcss/tailwind.css';
import 'daisyui/dist/full.css';
import SkeletonAvatar from 'antd/es/skeleton/Avatar';
import { RxAvatar } from 'react-icons/rx';
import { FaCircleUser } from 'react-icons/fa6';
import EditProfile from './EditProfile';

const { Title, div } = Typography;

const Profile = () => {
    const { user } = useAuth();
    const { users, refetch, isLoading, isError, error } = useUsers();
    const [passwordVisible, setPasswordVisible] = useState(false);

    // Find the authenticated user's information from the users array
    const currentUser = users.find(u => u.email === user?.email);

    if (!user || !currentUser) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" tip="Loading..." />
            </div>
        );
    }

    const statusText = currentUser.status === 'Active' ? 'Active' : 'Inactive';
    const statusBadgeStyle = currentUser.status === 'Active' ? 'badge-success' : 'badge-error';
    const statusIcon = currentUser.status === 'Active' ? '✅' : '❌';

    return (
        <div className="bg-gray-100 py-10">
            <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="avatar">
                        <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <FaCircleUser size={130} />
                        </div>
                    </div>
                    <Title level={2} className="mt-4 mb-2">{currentUser.name}</Title>
                    <div>
                    <EditProfile userId={currentUser._id} refetch={refetch} />
                    </div>
                </div>
                <div className="divider"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                    <div>
                        <Title level={5}>Email</Title>
                        <div className='badge badge-lg badge-primary text-md'><p className='text-white'><MailOutlined /> {currentUser.email}</p></div>
                    </div>
                    <div>
                        <Title level={5}>Position</Title>
                        <div className='badge badge-lg badge-primary text-md'><p className="text-white">{currentUser.position}</p></div>
                    </div>
                    <div>
                        <Title level={5}>Role</Title>
                        <div className='badge badge-lg badge-primary text-md'><p className="text-white">{currentUser.role}</p></div>
                    </div>
                    <div>
                        <Title level={5}>Status</Title>
                        <div className={`btn btn-sm ${statusBadgeStyle} text-md`}>
                            <p className="text-white">{statusText} {statusIcon}</p>
                        </div>
                    </div>
                    <div>
                        <Title level={5}>Created at</Title>
                        <div className='badge badge-lg badge-primary text-md'><p className="text-white">{currentUser.date}</p></div>
                    </div>
                    <div>
                        <Title level={5}>Password</Title>
                        <Input
                            type={passwordVisible ? 'text' : 'password'} // Toggle between text and password type
                            value={currentUser.password} // Use the password from the user data
                            readOnly // Make the input read-only for security
                            style={{ width: '75%', marginBottom: '10px' }}
                            suffix={
                                <span onClick={() => setPasswordVisible(!passwordVisible)} style={{ cursor: 'pointer' }}>
                                    {passwordVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                </span>
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

import React, { useContext, useEffect, useState } from 'react';
import { Button, ConfigProvider, DatePicker, Form, Input, message, Modal, Select, Spin } from 'antd';
import { createStyles } from 'antd-style';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import { MdUpdate } from 'react-icons/md';
import dayjs from 'dayjs';
import { EditOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { AuthContext } from '../../providers/AuthProvider';
import useAuth from '../../Hooks/useAuth';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebase/firebase.config';
import useMe from '../../Hooks/useMe';


const auth = getAuth(app);

const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
      border-width: 0;

      > span {
        position: relative;
      }

      &::before {
        content: '';
        background: linear-gradient(135deg, #6253e1, #04befe);
        position: absolute;
        inset: 0;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0;
      }
    }
  `,
}));

const EditProfile = ({ userId, refetch }) => {
    const axiosSecure = useAxiosSecure();
    const { styles } = useStyle();
    const { updateUserEmail, updateUserPassword } = useContext(AuthContext);
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [userData, setUserData] = useState(null);
    const { user } = useMe();

    useEffect(() => {
        if (modalOpen && userId) {
            // Fetch the latest profile info when the modal opens
            const fetchSupplier = async () => {
                try {
                    setLoading(true);
                    const response = await axiosSecure.get(`/user/${userId}`);
                    const data = response.data?.data;
                    setUserData(data);
                    form.setFieldsValue(data);
                } catch (error) {
                    message.error('Failed to fetch profile info');
                } finally {
                    setLoading(false);
                }
            };
            fetchSupplier();
        }
    }, [modalOpen, userId, form, axiosSecure]);

    // console.log(auth?.currentUser)

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);


            // Update user in the database
            await axiosSecure.put(`/user/${userId}`, values);

            // Update user's email and password in Firebase Authentication
            /* if (user) {
                if (values.email !== user.email) {
                    console.log(user)
                    await updateUserEmail(auth.currentUser, values.email);
                }
                if (values.password) {
                    await updateUserPassword(auth.currentUser, values.password);
                }
            } */

            message.success('User updated successfully');
            form.resetFields();
            setModalOpen(false);
            refetch(); // Refetch data to update the table
        } catch (error) {
            message.error('Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ConfigProvider button={{ className: styles.linearGradientButton }}>
                <Button type="primary" size="medium" icon={<EditOutlined />} onClick={() => setModalOpen(true)}>
                    Edit
                </Button>
            </ConfigProvider>
            <Modal title="Edit Profile" centered open={modalOpen} footer={null} onCancel={() => setModalOpen(false)}>
                <div className="divider mt-0"></div>
                <Spin spinning={loading}>
                    <Form
                        layout="vertical"
                        form={form}
                        initialValues={{ layout: 'vertical' }}
                        onFinish={handleSubmit}
                        style={{ maxWidth: 600 }}
                    >
                        <Form.Item
                            label="Full Name"
                            name="name"
                            rules={[{ required: true, message: 'Please input name!' }]}
                        >
                            <Input placeholder="Enter name" />
                        </Form.Item>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: 'Please input email!' }]}
                        >
                            <Input type='email' disabled placeholder="Enter email" />
                        </Form.Item>
                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Please input password!' }]}
                        >
                            <Input
                                disabled
                                type={passwordVisible ? 'text' : 'password'}
                                value="password"
                                style={{ width: '75%', marginBottom: '10px' }}
                                suffix={
                                    <span onClick={() => setPasswordVisible(!passwordVisible)} style={{ cursor: 'pointer' }}>
                                        {passwordVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                    </span>
                                }
                            />            </Form.Item>
                        <Form.Item
                            label="Position"
                            name="position"
                            rules={[{ required: true, message: 'Please input your position!' }]}
                        >
                            <Input placeholder="Enter your position" />
                        </Form.Item>
                        <Form.Item className="mt-6 mb-1">
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Update</Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </>
    );
};

export default EditProfile;

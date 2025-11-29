import React, { useContext, useEffect, useState } from 'react';
import { Button, ConfigProvider, Form, Input, message, Modal, Select, Spin } from 'antd';
import { createStyles } from 'antd-style';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import { MdUpdate } from 'react-icons/md';
import { AuthContext } from '../../providers/AuthProvider';
import useAuth from '../../Hooks/useAuth';

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

const EditUser = ({ userId, refetch }) => {
    const axiosSecure = useAxiosSecure();
    const { styles } = useStyle();
    const { updateUserEmail, updateUserPassword } = useContext(AuthContext);
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (modalOpen && userId) {
            // Fetch the latest airline data when the modal opens
            const fetchUser = async () => {
                try {
                    setLoading(true);
                    const response = await axiosSecure.get(`/user/${userId}`);
                    setUserData(response.data?.data);
                    form.setFieldsValue(response.data?.data);
                } catch (error) {
                    message.error('Failed to fetch user data');
                } finally {
                    setLoading(false);
                }
            };
            fetchUser();
        }
    }, [modalOpen, userId, form, axiosSecure]);

    // console.log(user?.email, user?.displayName)
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);


            // Update user in the database
            const res = await axiosSecure.put(`/user/${userId}`, values);
            console.log(res)

            // // Update user's email and password in Firebase Authentication
            /* if (values.email !== user?.email) {
                const response = await updateUserEmail(auth.currentUser, values.email);
                console.log(response)
            }
            if (values.password) {
                await updateUserPassword(auth.currentUser, values.password);
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
                <Button type="primary" size="medium" icon={<MdUpdate />} onClick={() => setModalOpen(true)}>
                    Edit
                </Button>
            </ConfigProvider>
            <Modal
                title="Edit User"
                centered
                open={modalOpen}
                footer={null}
                onCancel={() => setModalOpen(false)}
            >
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
                            rules={[{ required: true, message: 'Please input the full name!' }]}
                        >
                            <Input placeholder="Enter full name" />
                        </Form.Item>
                        <Form.Item
                            label="Position"
                            name="position"
                            rules={[{ required: true, message: 'Please input the position!' }]}
                        >
                            <Input placeholder="Enter position" />
                        </Form.Item>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: 'Please input the email!' }]}
                        >
                            <Input disabled placeholder="Enter email" />
                        </Form.Item>
                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                { required: true, message: 'Please input your password!' },
                                { min: 6, message: 'Password must be at least 6 characters long!' },
                                { pattern: /^(?=.*[0-9])(?=.*[a-zA-Z]).{6,}$/, message: 'Password must contain at least 1 letter and 1 digit!' }
                            ]}
                        >
                            <Input disabled placeholder="Enter password" />
                        </Form.Item>
                        <Form.Item
                            label="Role"
                            name="role"
                            rules={[{ required: true, message: 'Please select the role!' }]}
                        >
                            <Select placeholder="Select role">
                                <Select.Option value="Admin">Admin</Select.Option>
                                <Select.Option value="Sales">Sales</Select.Option>
                            </Select>
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

export default EditUser;

import React, { useContext, useState } from 'react';
import { Form, Input, Button, notification, Spin, ConfigProvider, Modal, Select, DatePicker, message } from 'antd';
import useAxiosUser from '../../Hooks/useAxiosUser';
import { AuthContext } from '../../providers/AuthProvider';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { BiSolidUserAccount } from 'react-icons/bi';

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

const AddUser = ({ refetch }) => {
  const axiosUser = useAxiosUser();
  const { createUser, updateUserProfile } = useContext(AuthContext);
  const { styles } = useStyle();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      // Validate form fields
      const values = await form.validateFields();
      const currentDate = dayjs().format('YYYY-MM-DD'); // Set current date
      setLoading(true);

      // Step 1: Post User Data
      const userInfo = {
        name: values.name,
        email: values.email,
        position: values.position, // Include position
        role: values.role, // Include role
        password: values.password, // Include password
        date: currentDate, // Include current date
        status: 'Activate',
      };

      const response = await axiosUser.post('/user', userInfo);
      console.log('Response from server:', response.data);

      // Check if user data submission was successful
      if (response.data.insertedId) {
        // Step 2: Create User Account in Firebase
        const result = await createUser(values.email, values.password);
        const loggedUser = result.user;
        console.log('Logged User:', loggedUser);

        // Notify user of successful account creation
        notification.success({
          message: 'User Created',
          description: 'User has been created successfully!',
          placement: 'topRight',
        });

        // Update user profile in Firebase
        await updateUserProfile(values.name);

        // Reset form and close modal
        form.resetFields();
        setModalOpen(false); // Close modal if applicable
        refetch(); // Refetch users or data

      } else {
        // If the user data submission failed, throw an error
        throw new Error('User data submission failed.');
      }

    } catch (error) {
      console.error('Failed to submit the form:', error);
      const errorMessage = error.response?.data?.message || 'An unknown error occurred.';
      notification.error({
        message: 'Submission Failed',
        description: errorMessage,
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (value) => {
    if (value === "ClientArea") {
      message.warning("This option is not yet available now.");
    }
  };

  return (
    <>
      <ConfigProvider
        button={{
          className: styles.linearGradientButton,
        }}
      >
        <Button type="primary" size="large" icon={<BiSolidUserAccount />} onClick={() => setModalOpen(true)}>
          Add User
        </Button>
      </ConfigProvider>
      <Modal
        title="Add User"
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
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please input the email!' }]}
            >
              <Input placeholder="Enter email" />
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
              <Input.Password placeholder="Enter password" />
            </Form.Item>
            <Form.Item
              label="Position"
              name="position"
              rules={[{ required: true, message: 'Please input the position!' }]}
            >
              <Input placeholder="Enter position" />
            </Form.Item>
            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: 'Please select the role!' }]}
            >
              <Select placeholder="Select role" onChange={handleSelectChange}>
                <Select.Option value="Admin">Admin</Select.Option>
                <Select.Option value="Sales">Sales</Select.Option>
                <Select.Option value="ClientArea" disabled>
                  ClientArea
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item className="mt-6 mb-1">
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                Create User
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  );
};

export default AddUser;

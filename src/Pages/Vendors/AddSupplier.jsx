import React, { useState } from 'react';
import { Button, ConfigProvider, Form, Input, message, Modal, Spin, Select, DatePicker } from 'antd';
import { createStyles } from 'antd-style';
import { IoMdAddCircleOutline } from 'react-icons/io';
import useAxiosUser from '../../Hooks/useAxiosUser';
import dayjs from 'dayjs';
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

const AddSupplier = ({ refetch }) => {
    const axiosUser = useAxiosUser();
    const { styles } = useStyle();
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            values.date = dayjs(values.date).format('YYYY-MM-DD'); // Format the date

            const openingBalance = Number(values.openingBalance);

            // Calculate totalDue based on the opening balance and account type
            const totalDue =
                values.accountType === 'Credit'
                    ? values.openingBalance
                    : -values.openingBalance; // For Debit, set totalDue to negative opening balance
            // console.log(totalDue)

            setLoading(true);
            const response = await axiosUser.post('/supplier', {
                ...values,
                status: 'Active',
                totalDue, // Add totalDue here
                sellBy: user?.displayName
            });
            // console.log(response.data);
            message.success('Supplier added successfully');
            form.resetFields();
            setModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to submit the form:', error);
            message.error('Failed to add supplier');
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <ConfigProvider
                button={{
                    className: styles.linearGradientButton,
                }}
            >
                <Button type="primary" size="large" icon={<IoMdAddCircleOutline />} onClick={() => setModalOpen(true)}>
                    Add Supplier
                </Button>
            </ConfigProvider>
            <Modal
                title="Add Supplier"
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
                            label="Supplier Name"
                            name="supplierName"
                            rules={[{ required: true, message: 'Please input the supplier name!' }]}
                        >
                            <Input placeholder="Enter supplier name" />
                        </Form.Item>
                        <Form.Item
                            label="Account Type"
                            name="accountType"
                            rules={[{ required: true, message: 'Please select the account type!' }]}
                        >
                            <Select placeholder="Select account type">
                                <Select.Option value="Credit">Credit</Select.Option>
                                <Select.Option value="Debit">Debit</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Opening Balance"
                            name="openingBalance"
                            rules={[{ required: true, message: 'Please input the opening balance!' }]}
                        >
                            <Input type="number" placeholder="Enter opening balance" />
                        </Form.Item>
                        <Form.Item
                            label="Date"
                            name="date"
                            rules={[{ required: true, message: 'Please select the date!' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item className="mt-6 mb-1">
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </>
    );
};

export default AddSupplier;

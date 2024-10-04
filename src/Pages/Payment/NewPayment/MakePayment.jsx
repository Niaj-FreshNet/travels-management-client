import React, { useEffect, useState } from 'react';
import { Button, ConfigProvider, Form, Input, message, Modal, Spin, Upload } from 'antd';
import { createStyles } from 'antd-style';
import { UploadOutlined } from '@ant-design/icons';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import { MdUpdate } from 'react-icons/md';
import { RiSecurePaymentLine } from 'react-icons/ri';

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

const MakePayment = ({ refetch, totalDue }) => {
    const axiosUser = useAxiosUser();
    const { styles } = useStyle();
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (modalOpen) {
            form.setFieldsValue({ totalDue: totalDue });
        }
    }, [totalDue, modalOpen]);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            const currentDate = new Date();
            const submissionDate = currentDate.toISOString().split('T')[0];
            const response = await axiosUser.post('/payment', {
                ...values,
                totalDue,
                submissionDate, // Include submissionDate in the data sent to the server
            });

            if (response.status === 200) {
                message.success('Payment submitted successfully');
                form.resetFields();
                setModalOpen(false);
                refetch(); // Refetch data to update the table
            } else {
                throw new Error('Failed to submit payment');
            }
        } catch (error) {
            console.error('Failed to submit payment:', error);
            message.error('Failed to submit payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ConfigProvider button={{ className: styles.linearGradientButton }}>
                <Button type="primary" size="large" icon={<RiSecurePaymentLine />} onClick={() => setModalOpen(true)}>
                    Make Payment
                </Button>
            </ConfigProvider>
            <Modal title="Make Payment" centered open={modalOpen} footer={null} onCancel={() => setModalOpen(false)}>
                <div className="divider mt-0"></div>
                <Spin spinning={loading}>
                    <Form
                        layout="vertical"
                        form={form}
                        style={{ maxWidth: 600 }}
                        onFinish={handleSubmit}
                        onValuesChange={(changedValues, allValues) => {
                            if (changedValues.paidAmount !== undefined) {
                                form.setFieldsValue({
                                    difference: (totalDue - allValues.paidAmount).toFixed(2),
                                });
                            }
                        }}
                    >
                        <Form.Item label="Total Due" name="totalDue">
                            <Input value={totalDue} readOnly />
                        </Form.Item>
                        <Form.Item label="Amount" name="paymentAmount" rules={[{ required: true, message: 'Please input the amount!' }]}>
                            <Input type="number" placeholder="Enter amount" />
                        </Form.Item>
                        <Form.Item label="Difference" name="difference">
                            <Input readOnly />
                        </Form.Item>
                        <Form.Item label="Upload Image" name="image" rules={[{ required: false, message: 'Please upload an image!' }]}>
                            <Upload beforeUpload={() => false} listType="picture">
                                <Button icon={<UploadOutlined />}>Click to Upload</Button>
                            </Upload>
                        </Form.Item>
                        <Form.Item className='mt-6 mb-1'>
                            <Button type="primary" style={{ width: '100%' }} htmlType="submit" loading={loading}>
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </>
    );
};

export default MakePayment;

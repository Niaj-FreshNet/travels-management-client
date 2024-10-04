import React, { useEffect, useState } from 'react';
import { Button, ConfigProvider, DatePicker, Form, Input, message, Modal, Select, Spin, Upload } from 'antd';
import { createStyles } from 'antd-style';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import { MdUpdate } from 'react-icons/md';
import dayjs from 'dayjs';
import { UploadOutlined } from '@ant-design/icons';

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

const EditPayment = ({ paymentId, refetch }) => {
  const axiosUser = useAxiosUser();
  const { styles } = useStyle();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    if (modalOpen && paymentId) {
      // Fetch the latest payment data when the modal opens
      const fetchPayment = async () => {
        try {
          setLoading(true);
          const response = await axiosUser.get(`/payment/${supplierId}`);
          const data = response.data;
          data.date = dayjs(data.date); // Using dayjs to convert the date
          setPayment(data);
          form.setFieldsValue(data);
        } catch (error) {
          message.error('Failed to fetch payment data');
        } finally {
          setLoading(false);
        }
      };
      fetchPayment();
    }
  }, [modalOpen, paymentId, form, axiosUser]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await axiosUser.put(`/payment/${paymentId}`, values);
      message.success('Payment updated successfully');
      form.resetFields();
      setModalOpen(false);
      refetch(); // Refetch data to update the table
    } catch (error) {
      message.error('Failed to update payment');
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
      <Modal title="Edit Payment" centered open={modalOpen} footer={null} onCancel={() => setModalOpen(false)}>
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
              label="New Paid Amount"
              name="newPaidAmount"
              rules={[{ required: true, message: 'Please input the new paid amount!' }]}
            >
              <Input value={''} />
            </Form.Item>
            <div className='mb-16'>
                Current Image
            </div>
            <Form.Item label="Replace Image" name="image" rules={[{ required: false, message: 'Please upload an image!' }]}>
              <Upload beforeUpload={() => false} listType="picture">
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
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

export default EditPayment;
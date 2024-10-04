import React, { useEffect, useState } from 'react';
import { Button, ConfigProvider, Form, Input, message, Modal, Spin } from 'antd';
import { createStyles } from 'antd-style';
import useAxiosUser from '../../Hooks/useAxiosUser';
import { MdUpdate } from 'react-icons/md';

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

const EditAirline = ({ airlineId, refetch }) => {
  const axiosUser = useAxiosUser();
  const { styles } = useStyle();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [airline, setAirline] = useState(null);

  useEffect(() => {
    if (modalOpen && airlineId) {
      // Fetch the latest airline data when the modal opens
      const fetchAirline = async () => {
        try {
          setLoading(true);
          const response = await axiosUser.get(`/airline/${airlineId}`);
          setAirline(response.data);
          form.setFieldsValue(response.data);
        } catch (error) {
          message.error('Failed to fetch airline data');
        } finally {
          setLoading(false);
        }
      };
      fetchAirline();
    }
  }, [modalOpen, airlineId, form, axiosUser]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await axiosUser.put(`/airline/${airlineId}`, values);
      message.success('Airline updated successfully');
      form.resetFields();
      setModalOpen(false);
      refetch(); // Refetch data to update the table
    } catch (error) {
      message.error('Failed to update airline');
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
      <Modal title="Edit Airline" centered open={modalOpen} footer={null} onCancel={() => setModalOpen(false)}>
        <div className="divider mt-0"></div>
        <Spin spinning={loading}>
          <Form
            layout="vertical"
            form={form}
            style={{ maxWidth: 600 }}
            onFinish={handleSubmit}
          >
            <Form.Item label="Airline Name" name="airlineName" rules={[{ required: true, message: 'Please input the airline name!' }]}>
              <Input placeholder="" />
            </Form.Item>
            <Form.Item label="IATA Name" name="iataName" rules={[{ required: true, message: 'Please input the IATA name!' }]}>
              <Input placeholder="" />
            </Form.Item>
            <Form.Item label="Airline Code" name="airlineCode" rules={[{ required: true, message: 'Please input the airline code!' }]}>
              <Input type="number" placeholder="" />
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

export default EditAirline;

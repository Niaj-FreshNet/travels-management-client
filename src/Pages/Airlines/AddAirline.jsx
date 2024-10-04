import React, { useState } from 'react';
import { Button, ConfigProvider, Form, Input, message, Modal, Spin } from 'antd';
import { createStyles } from 'antd-style';
import { IoMdAddCircleOutline } from 'react-icons/io';
import useAxiosUser from '../../Hooks/useAxiosUser';

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

const AddAirline = ({ refetch }) => {
  const axiosUser = useAxiosUser();
  const { styles } = useStyle();
  const [modal2Open, setModal2Open] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false); // State to manage loading

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true); // Start loading
      const response = await axiosUser.post('/airline', { ...values, status: 'Active' });
      console.log(response.data);
      message.success('Airline added successfully');
      form.resetFields(); // Reset the form fields after submission
      setModal2Open(false); // Close the modal after submission
      refetch(); // Refetch the data
    } catch (error) {
      console.error('Failed to submit the form:', error);
      message.error('Failed to add airline');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleIATAChange = (e) => {
    const { value } = e.target;
    form.setFieldsValue({
      iata: value.toUpperCase(),
    });
  };

  return (
    <>
      <ConfigProvider
        button={{
          className: styles.linearGradientButton,
        }}
      >
        <Button type="primary" size="large" icon={<IoMdAddCircleOutline />}
          onClick={() => setModal2Open(true)}>
          Add Airline
        </Button>
      </ConfigProvider>
      <Modal
        title="Add Airline"
        centered
        open={modal2Open}
        footer={null}
        onCancel={() => setModal2Open(false)}
      >
        <div className="divider mt-0"></div>
        <Spin spinning={loading}> {/* Wrap the form in Spin */}
          <Form
            layout="vertical"
            form={form}
            initialValues={{
              layout: 'vertical',
            }}
            style={{
              maxWidth: 600,
            }}
            onFinish={handleSubmit}
          >
            <Form.Item
              label="Airline Name"
              name="airlineName"
              rules={[{ required: true, message: 'Please input the airline name!' }]}
            >
              <Input placeholder="" />
            </Form.Item>
            <Form.Item
              label="IATA Name"
              name="iataName"
              rules={[{ required: true, message: 'Please input the IATA name!' }]}
            >
              <Input placeholder="" onChange={handleIATAChange} />
            </Form.Item>
            <Form.Item
              label="Airline Code"
              name="airlineCode"
              rules={[{ required: true, message: 'Please input the airline code!' }]}
            >
              <Input type="number" placeholder="" />
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

export default AddAirline;

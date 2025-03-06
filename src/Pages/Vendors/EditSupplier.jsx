import React, { useEffect, useState } from 'react';
import { Button, ConfigProvider, DatePicker, Form, Input, message, Modal, Select, Spin } from 'antd';
import { createStyles } from 'antd-style';
import useAxiosUser from '../../Hooks/useAxiosUser';
import { MdUpdate } from 'react-icons/md';
import dayjs from 'dayjs';

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

const EditSupplier = ({ supplierId, refetch }) => {
  const axiosUser = useAxiosUser();
  const { styles } = useStyle();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [supplier, setSupplier] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (modalOpen && supplierId) {
      // Fetch the latest supplier data when the modal opens
      const fetchSupplier = async () => {
        try {
          setLoading(true);
          const response = await axiosUser.get(`/supplier/${supplierId}`);
          const data = response.data;
          data.date = dayjs(data.date); // Using dayjs to convert the date
          setSupplier(data);
          setData(data);
          form.setFieldsValue(data);
          console.log(data)
        } catch (error) {
          message.error('Failed to fetch supplier data');
        } finally {
          setLoading(false);
        }
      };
      fetchSupplier();
    }
  }, [modalOpen, supplierId, form, axiosUser]);
  console.log(data)

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.date = dayjs(values.date).format('YYYY-MM-DD'); // Format the date

      setLoading(true);
      await axiosUser.put(`/supplier/${supplierId}`, values);


      const initialOpeningBalance = Number(data.openingBalance);
      const updatedOpeningBalance = Number(values.openingBalance);
      const totalDue = data.totalDue;
      const supplierName = data.supplierName;
      const accountType = values.accountType;

      if (initialOpeningBalance !== updatedOpeningBalance) {
        const amountDifference = updatedOpeningBalance - initialOpeningBalance;

        // Adjust totalDue based on accountType
        let updatedTotalDue;
        if (accountType === 'Credit') {
          updatedTotalDue = totalDue + amountDifference;
        } else if (accountType === 'Debit') {
          updatedTotalDue = totalDue - amountDifference;
        }

        // Update the total due amount of the selected supplier
        await axiosUser.patch(`/supplier/${supplierName}`, {
          totalDue: updatedTotalDue,
        });
      }

      message.success('Supplier updated successfully');
      form.resetFields();
      setModalOpen(false);
      refetch(); // Refetch data to update the table
    } catch (error) {
      message.error('Failed to update supplier');
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
      <Modal title="Edit Supplier" centered open={modalOpen} footer={null} onCancel={() => setModalOpen(false)}>
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
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Update</Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  );
};

export default EditSupplier;

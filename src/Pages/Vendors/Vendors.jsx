import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Layout, message, Popconfirm, Space, Table, Tag, theme, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import useAxiosUser from '../../Hooks/useAxiosUser';
import useSuppliers from '../../Hooks/useSuppliers';
import AddSupplier from './AddSupplier';
import EditSupplier from './EditSUpplier';
import useIsSuperAdmin from '../../Hooks/useIsSuperAdmin';

const { Header, Content } = Layout;

const Vendors = () => {
  const { suppliers, refetch, isLoading, isError, error } = useSuppliers();
  const axiosUser = useAxiosUser();
  const [isSuperAdmin] = useIsSuperAdmin();

  const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
  const [deletingItemId, setDeletingItemId] = useState(null);

  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth <= 768) {
            setMarginStyle({ margin: '0 8px 0 8px' });
        } else if (window.innerWidth >= 1200) {
            setMarginStyle({ margin: '0 16px 0 16px' });
        } else {
            setMarginStyle({ margin: '0 8px 0 16px' });
        }
    };

    // Initialize the margin style based on the current window size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
    };
}, []);

  const updateStatus = async (id, status) => {
    try {
      const newStatus = status === 'Active' ? 'Inactive' : 'Active';
      await axiosUser.put(`/supplier/${id}/status`, { status: newStatus });
      message.success('Status updated successfully');
      refetch();
    } catch (err) {
      console.error('Error updating status:', err);
      message.error('Failed to update status');
    }
  };

  const deleteSupplier = async (id) => {
    setDeletingItemId(id);
    try {
      await axiosUser.delete(`/supplier/${id}`);
      message.success('Supplier deleted successfully');
      setTimeout(() => {
      refetch();
      setDeletingItemId(null);
    }, 500);
    } catch (err) {
      console.error('Error deleting supplier:', err);
      message.error('Failed to delete supplier');
      setDeletingItemId(null);
    }
  };

  const columns = [
    {
      title: 'Serial',
      key: 'serial',
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      align: 'center',
    },
    ...(isSuperAdmin ? [{
      title: 'Office ID',
      dataIndex: 'officeId',
      key: 'officeId',
      align: 'center',
      render: (text, record) => (
        <Typography.Text>{record.officeId}</Typography.Text>
      ),
    }] : []),
    {
      title: 'Supplier Name',
      dataIndex: 'supplierName',
      key: 'supplierName',
      align: 'center',
    },
    {
      title: 'Category',
      dataIndex: 'accountType',
      key: 'accountType',
      align: 'center',
    },
    {
      title: 'Total Due',
      key: 'totalDue',
      dataIndex: 'totalDue',
      align: 'center',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      align: 'center',
      render: (status, record) => {
        if (!status) {
          return <Tag color="default" className='font-bold'>UNKNOWN</Tag>;
        }

        let color;
        if (status === 'Active') {
          color = 'green';
        } else if (status === 'Inactive') {
          color = 'red';
        }
        return (
          <Tag
            color={color}
            key={status}
            className='font-bold'
            onClick={() => updateStatus(record._id, status)}
            style={{ cursor: 'pointer' }}
          >
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <EditSupplier supplierId={record._id} refetch={refetch} />
          <Popconfirm
            title="Delete the Supplier"
            description="Are you sure to delete this Supplier?"
            icon={
              <QuestionCircleOutlined
                style={{ color: 'red' }}
              />
            }
            onConfirm={() => deleteSupplier(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              loading={deletingItemId === record._id}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <>
      <Header
        className='flex justify-between items-center shadow-lg py-4 pl-4 pr-3 md:px-8'
        style={{ background: colorBgContainer }}
      >
        <div>
          <h2 className='text-2xl md:text-4xl font-bold'>Suppliers</h2>
        </div>
        <div className='mt-1'>
          <AddSupplier refetch={refetch} />
        </div>
      </Header>
      <Content
        style={marginStyle}
      >
        <Breadcrumb
        style={{ margin: '16px 0' }}
        items={[
          {
            title: 'Home',
          },
          {
            title: 'Vendors',
          },
        ]}
      />
        <div
          style={{
            minHeight: 360,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Table
            columns={columns}
            dataSource={suppliers}
            loading={isLoading}
            rowKey="_id"
            pagination={false}
            scroll={{ x: 'max-content' }} // Enable horizontal scroll if needed
          />
        </div>
      </Content>
    </>
  );
};

export default Vendors;

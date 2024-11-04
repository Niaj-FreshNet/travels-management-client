import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Layout, message, Popconfirm, Space, Table, Tag, theme } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import AddAirline from './AddAirline';
import EditAirline from './EditAirline';
import useAirlines from '../../Hooks/useAirlines';
import useAxiosUser from '../../Hooks/useAxiosUser';
import './styles.css'; // Make sure to import your CSS file

const { Header, Content } = Layout;

const Airlines = () => {
  const { airlines, refetch, isLoading, isError, error } = useAirlines();
  const axiosUser = useAxiosUser();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
      await axiosUser.put(`/airline/${id}/status`, { status: newStatus });
      message.success('Status updated successfully');
      refetch();
    } catch (err) {
      console.error('Error updating status:', err);
      message.error('Failed to update status');
    }
  };

  const deleteAirline = async (id) => {
    setDeletingItemId(id); // Set the item being deleted
    try {
      await axiosUser.delete(`/airline/${id}`);
      message.success('Airline deleted successfully');
      setTimeout(() => {
        refetch();
        setDeletingItemId(null); // Clear the deleting item state after refetch
      }, 500); // Delay refetch to allow for animation
    } catch (err) {
      console.error('Error deleting airline:', err);
      message.error('Failed to delete airline');
      setDeletingItemId(null); // Clear the deleting item state on error
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
      title: 'Airline Name',
      dataIndex: 'airlineName',
      key: 'airlineName',
      align: 'center',
    },
    {
      title: 'IATA Name',
      dataIndex: 'iataName',
      key: 'iataName',
      align: 'center',
    },
    {
      title: 'Airline Code',
      key: 'airlineCode',
      dataIndex: 'airlineCode',
      align: 'center',
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
          <EditAirline airlineId={record._id} refetch={refetch} />
          <Popconfirm
            title="Delete the Airline"
            description="Are you sure to delete this Airline?"
            icon={
              <QuestionCircleOutlined
                style={{ color: 'red' }}
              />
            }
            onConfirm={() => deleteAirline(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              loading={deletingItemId === record._id} // Show loading spinner if deleting
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
          <h2 className='text-2xl md:text-4xl font-bold'>Airlines & Services</h2>
        </div>
        <div className='mt-1'>
          <AddAirline refetch={refetch} />
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
              title: 'Airlines & Services',
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
            dataSource={airlines.map(item => ({
              ...item,
              className: deletingItemId === item._id ? 'deleting' : '',
            }))}
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

export default Airlines;

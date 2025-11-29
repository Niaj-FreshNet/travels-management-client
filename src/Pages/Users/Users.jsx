import React, { useState, useEffect } from 'react';
import { Layout, Table, Button, Typography, Spin, Modal, Breadcrumb, message, Popconfirm, Tag, theme, Dropdown, Menu, Space } from "antd";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import AddUser from './AddUser';
import EditUser from './EditUser';
import useUsers from '../../Hooks/useUsers';
import useIsSuperAdmin from '../../Hooks/useIsSuperAdmin';
import useAllUsers from '../../Hooks/useAllUsers';
import useUsersTotalDue from '../../Hooks/useUsersTotalDue';

const { Header, Content } = Layout;
const { Title } = Typography;

const Users = () => {
  const axiosSecure = useAxiosSecure();
  const [isSuperAdmin, isSuperAdminLoading] = useIsSuperAdmin();
  const { data: usersTotalDue = [], isLoading: isTotalDueLoading } = useUsersTotalDue();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  // console.log('isSuperAdmin:', isSuperAdmin)

  const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
  const [deletingItemId, setDeletingItemId] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Fetch users with pagination
  const { users, pagination: usersPagination, refetch, isLoading: isUsersLoading } = !isSuperAdmin
    ? useUsers(page, limit)
    : { users: [], pagination: { page, limit, total: 0 }, refetch: () => { }, isLoading: false };

  const { allUsers, pagination: allUsersPagination, isLoading: isAllUsersLoading } = isSuperAdmin
    ? useAllUsers(page, limit)
    : { allUsers: [], pagination: { page, limit, total: 0 }, isLoading: false };

  // Determine which dataset and pagination to use
  const dataSource = isSuperAdmin ? allUsers : users;
  const pagination = isSuperAdmin ? allUsersPagination : usersPagination;

  // Handle page/size changes
  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  // State variable to track user data with total due
  const [usersWithTotalDue, setUsersWithTotalDue] = useState([]);

  useEffect(() => {
    const mergedUsers = dataSource.map(user => {
      const totalDueObj = usersTotalDue.find(u => u.name === user.name);
      return {
        ...user,
        totalDue: totalDueObj ? totalDueObj.totalDue : 0
      };
    });

    setUsersWithTotalDue(mergedUsers);
  }, [dataSource, usersTotalDue]);

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

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const newStatus = status === 'active' ? 'inactive' : 'active';
      await axiosSecure.patch(`/user/${id}/status`, { status: newStatus });
      message.success('Status updated successfully');
      refetch();
    } catch (err) {
      console.error('Error updating status:', err);
      message.error('Failed to update status');
    }
  };

  const deleteUser = async (id) => {
    setDeletingItemId(id); // Set the item being deleted
    try {
      await axiosSecure.delete(`/user/${id}`);
      message.success('User deleted successfully');

      // Update the local state immediately
      const updatedUsers = usersWithTotalDue.filter((user) => user.id !== id);
      setUsersWithTotalDue(updatedUsers);

      setTimeout(() => {
        refetch(); // Refetch from the server to sync the data
        setDeletingItemId(null); // Clear the deleting item state after refetch
      }, 500); // Delay refetch to allow for animation
    } catch (err) {
      console.error('Error deleting user:', err);
      message.error('Failed to delete user');
      setDeletingItemId(null); // Clear the deleting item state on error
    }
  };

  const columns = [
    {
      title: 'Serial',
      dataIndex: 'serial',
      key: 'serial',
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    ...(isSuperAdmin ? [{
      title: 'Office ID',
      dataIndex: 'officeId',
      key: 'officeId',
      align: 'center',
      render: (text, record) => (
        <Typography.Text type="secondary">{record.officeId}</Typography.Text>
      ),
    }] : []),
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (text) => (
        <Typography.Text strong>{text}</Typography.Text>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      align: 'center',
      render: (text, record) => (
        <Typography.Text type="secondary">{record.email}</Typography.Text>
      ),
    },
    {
      title: 'Password',
      dataIndex: 'password',
      key: 'password',
      align: 'center',
      render: (text, record) => (
        <Typography.Text type="secondary">{record.password}</Typography.Text>
      ),
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      align: 'center',
      render: (text, record) => (
        <Typography.Text type="primary">{record.position}</Typography.Text>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      align: 'center',
      render: (text, record) => (
        <Typography.Text type="primary" className='uppercase'>{record.role}</Typography.Text>
      ),
    },
    {
      // :::::::::::::::::::::::::: HEY CHATGPT ::::::::::::::::::::::::::::::::::
      // USER'S TOTAL DUE (SUMMATION OF THE SUPPLIERS' totalDue which had been created by the USER (property>>> "sellBy"))
      title: 'Total Due',
      dataIndex: 'totalDue',
      key: 'totalDue',
      align: 'center',
      render: (totalDue) => (
        <Typography.Text type="primary">{totalDue}</Typography.Text>
      ),
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
        if (status === 'active') {
          color = 'green';
        } else if (status === 'inactive') {
          color = 'red';
        }
        return (
          <Tag
            color={color}
            key={status}
            className='font-bold text-base'
            onClick={() => updateStatus(record.id, status)}
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
      render: (_, record) => (
        <Space size="middle">
          <EditUser userId={record.id} refetch={refetch} />
          <Popconfirm
            title="Delete the User"
            description="Are you sure to delete this User?"
            icon={
              <QuestionCircleOutlined
                style={{ color: 'red' }}
              />
            }
            onConfirm={() => deleteUser(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              loading={deletingItemId === record.id} // Show loading spinner if deleting
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Corrected isLoading definition
  const isLoading = isSuperAdmin ? isAllUsersLoading : isUsersLoading;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <>
      <Header
        className='flex justify-between items-center shadow-lg py-4 pl-4 pr-3 md:px-8'
        style={{ background: colorBgContainer }}
      >
        <div>
          <h2 className='text-2xl md:text-4xl font-bold'>Listed Users</h2>
        </div>
        <div className='mt-1'>
          <AddUser refetch={refetch} />
        </div>
      </Header>
      <Content style={marginStyle}>
        <Breadcrumb
          style={{ margin: '16px 0' }}
          items={[
            {
              title: 'Home',
            },
            {
              title: 'Listed Users',
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
            dataSource={usersWithTotalDue}
            loading={isLoading}
            rowKey="id"
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }} // Enable horizontal scroll if needed
          />
        </div>
      </Content>
    </>
  );
};

export default Users;

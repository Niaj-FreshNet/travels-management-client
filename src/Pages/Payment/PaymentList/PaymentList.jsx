import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Layout, message, Popconfirm, Space, Table, Tag, theme } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import EditPayment from './EditPayment';
import usePayment from '../../../Hooks/usePayment';

const { Header, Content } = Layout;

const PaymentList = () => {
    const { payment, refetch, isLoading, isError, error } = usePayment();
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

    const deletePayment = async (id) => {
        setDeletingItemId(id);
        try {
            await axiosUser.delete(`/payment/${id}`);
            message.success('Payment deleted successfully');
            setTimeout(() => {
                refetch();
                setDeletingItemId(null);
            }, 500);
        } catch (err) {
            console.error('Error deleting payment:', err);
            message.error('Failed to delete payment');
            setDeletingItemId(null);
        }
    };

    const columns = [
        {
            title: 'Serial',
            key: 'serial',
            render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
        },
        {
            title: 'Supplier Name',
            dataIndex: 'supplierName',
            key: 'supplierName',
        },
        {
            title: 'Payment Date',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
        },
        {
            title: 'Payment Amount',
            dataIndex: 'paymentAmount',
            key: 'paymentAmount',
        },
        {
            title: 'Receipt',
            key: 'receipt',
            dataIndex: 'receipt',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <EditPayment paymentId={record._id} refetch={refetch} />
                    <Popconfirm
                        title="Delete the Payment"
                        description="Are you sure to delete this Payment?"
                        icon={
                            <QuestionCircleOutlined
                                style={{ color: 'red' }}
                            />
                        }
                        onConfirm={() => deletePayment(record._id)}
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
                    <h2 className='text-2xl md:text-4xl font-bold'>Debit List</h2>
                </div>
            </Header>
            <Content
                style={marginStyle}
            >
                <Breadcrumb
                    style={{ margin: '16px 0' }}
                >
                    <Breadcrumb.Item>Payment</Breadcrumb.Item>
                    <Breadcrumb.Item>Payment List</Breadcrumb.Item>
                </Breadcrumb>
                <div
                    style={{
                        minHeight: 360,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Table
                        columns={columns}
                        dataSource={payment}
                        loading={isLoading}
                        rowKey="_id"
                        pagination={{
                            pageSize: pageSize,
                            onChange: (page, size) => {
                                setCurrentPage(page);
                                setPageSize(size);
                            },
                        }}
                        scroll={{ x: 'max-content' }} // Enable horizontal scroll if needed
                    />
                </div>
            </Content>
        </>
    );
};

export default PaymentList;
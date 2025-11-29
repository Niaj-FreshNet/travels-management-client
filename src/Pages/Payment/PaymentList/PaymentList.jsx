import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Layout, message, notification, Popconfirm, Space, Table, Tag, theme, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import EditPayment from './EditPayment';
import usePayment from '../../../Hooks/usePayment';
import Receipt from './Receipt';
import useSales from '../../../Hooks/useSales';
import useSuppliers from '../../../Hooks/useSuppliers';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import useIsSuperAdmin from '../../../Hooks/useIsSuperAdmin';

const { Header, Content } = Layout;

const PaymentList = () => {
    const { payment, refetch, isLoading, isError, error } = usePayment();
    const { sales } = useSales();
    const { suppliers} = useSuppliers();
    const axiosUser = useAxiosUser();
    const [isSuperAdmin, isSuperAdminLoading] = useIsSuperAdmin();

    const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
    const [deletingItemId, setDeletingItemId] = useState(null);

    // Combine and sort data
    const combinedData = [
        ...payment,
        ...sales
            .filter(sale => sale.isRefunded === 'Yes')
            .map(sale => ({
                ...sale,
                createdAt: sale.refundDate,
                paidAmount: sale.refundAmount,
                isRefunded: 'Yes', // Ensure isRefunded property is available
            })),
    ];

    combinedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

    const deletePayment = async (id, supplierName) => {
        setDeletingItemId(id);
        try {
             // Retrieve the payment details to get the paidAmount
             const paymentResponse = await axiosUser.get(`/payment/${id}`);
             const paidAmount = paymentResponse.data.paidAmount || 0;
 
             // Retrieve the supplier's totalDue from the suppliers data
             const supplier = suppliers.find(supplier => supplier.supplierName === supplierName);
             const currentTotalDue = supplier ? supplier.totalDue : 0;
 
             // Calculate the updated totalDue
             const updatedTotalDue = currentTotalDue + Number(paidAmount);
 
             // Update the supplier's totalDue in the database
             await axiosUser.patch(`/suppliers/due/${supplierName}`, { totalDue: updatedTotalDue });
 
             // Delete the payment from the database
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
    
    const handleRefundedSaleDeletion = (id) => {
        notification.warning({
            message: 'This payment is from refund',
            description: 'You must recover this from the refund list first.',
            placement: 'topRight',
            duration: 3, // Duration in seconds
        });
    };

    const columns = [
        {
            title: 'Serial',
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
            title: 'Payment Date',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
            align: 'center',
        },
        {
            title: 'Payment Amount',
            dataIndex: 'paidAmount',
            key: 'paidAmount',
            align: 'center',
        },
        {
            title: 'Receipt',
            key: 'receipt',
            dataIndex: 'receipt',
            align: 'center',
            render: (receipt) => (
                <Space size="middle">
                    <Receipt receipt={receipt} />
                </Space>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <EditPayment paymentId={record._id} isRefunded={record.isRefunded} refetch={refetch} />
                    <Popconfirm
                        title="Delete the Payment"
                        description="Are you sure to delete this Payment?"
                        icon={
                            <QuestionCircleOutlined
                                style={{ color: 'red' }}
                            />
                        }
                        onConfirm={() => {
                            if (record.isRefunded === 'Yes') {
                                handleRefundedSaleDeletion(record._id);
                            } else {
                                deletePayment(record._id, record.supplierName);
                            }
                        }}
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
                    items={[
                        {
                            title: 'Payment',
                        },
                        {
                            title: 'Payment List',
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
                        dataSource={combinedData}
                        loading={isLoading}
                        rowKey="_id"
                        pagination={false}
                        bordered
                        scroll={{ x: 'max-content' }} // Enable horizontal scroll if needed
                    />
                </div>
            </Content>
        </>
    );
};

export default PaymentList;
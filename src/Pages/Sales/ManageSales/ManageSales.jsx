import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Dropdown, Layout, Menu, message, Popconfirm, Space, Table, Tag, theme } from 'antd';
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import EditAirline from '../../Airlines/EditAirline';
import useSales from '../../../Hooks/useSales';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import './styles.css';
import useAirlines from '../../../Hooks/useAirlines';
import { useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;

const ManageSales = () => {
    // const { airlines } = useAirlines();
    const { sales, refetch, isLoading, isError, error } = useSales();

    const axiosUser = useAxiosUser();
    const navigate = useNavigate(); 
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
    const [deletingItemId, setDeletingItemId] = useState(null);
    const [flattenedSales, setFlattenedSales] = useState([]);

    useEffect(() => {
        // Flatten the nested sales data after it's fetched
        if (sales && Array.isArray(sales)) {
            const flatSales = sales.flatMap(sale => {
                // Check if sale.sales exists and is an array
                if (sale.sales && Array.isArray(sale.sales)) {
                    return sale.sales.map(saleItem => ({
                        _id: sale._id,   // Retain the main sale document's ID
                        date: sale.date,
                        rvNumber: sale.rvNumber,
                        sellBy: sale.sellBy,
                        mode: sale.mode,
                        postStatus: sale.postStatus,
                        paymentStatus: sale.paymentStatus,
                        // Access the nested sales array data
                        airlineCode: saleItem.airlineCode,
                        iataName: saleItem.iataName,
                        documentNumber: saleItem.documentNumber,
                        supplierName: saleItem.supplierName,
                        remarks: saleItem.remarks,
                    }));
                }
                return []; // Return an empty array if sale.sales is undefined or not an array
            });
            setFlattenedSales(flatSales);
        }
    }, [sales]);

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

    const updatePostStatus = async (id, postStatus) => {
        try {
            const newStatus = postStatus === 'Pending' ? 'Posted' : 'Pending';
            await axiosUser.put(`/sale/${id}/postStatus`, { postStatus: newStatus });
            message.success('Post Status updated successfully');
            refetch();
        } catch (err) {
            console.error('Error updating Post Status:', err);
            message.error('Failed to update Post Status');
        }
    };

    const updatePaymentStatus = async (id, paymentStatus, postStatus) => {
        // Check if postStatus is "Pending"
        if (postStatus === 'Pending') {
            message.error('Cannot change Payment Status while Post Status is Pending');
            return;
        }

        try {
            const newPayment = paymentStatus === 'Due' ? 'Paid' : 'Due';
            await axiosUser.put(`/sale/${id}/paymentStatus`, { paymentStatus: newPayment });
            message.success('Payment Status updated successfully');
            refetch();
        } catch (err) {
            console.error('Error updating Payment status:', err);
            message.error('Failed to update Payment Status');
        }
    };

    const handleMenuClick = async (key, record) => {
        switch (key) {
            case 'edit':
                // Redirect to the EditSale component with the id of the record
                navigate(`/sale/${record._id}`); // Adjust the path as needed
                break;
            case 'delete':
                // Open Popconfirm for deletion
                break;
            case 'print':
                // Trigger print logic
                handlePrint(record);
                break;
            default:
                break;
        }
    };

    // Handle the deletion of a sale only after confirmation
    const confirmDelete = async (id) => {
        setDeletingItemId(id); // Set the item being deleted
        try {
            await axiosUser.delete(`/sale/${id}`);
            message.success('Sale deleted successfully');
            refetch(); // Refetch the sales data after deletion
            setDeletingItemId(null); // Clear the deleting item state after refetch
        } catch (err) {
            console.error('Error deleting sale:', err);
            message.error('Failed to delete sale');
            setDeletingItemId(null); // Clear the deleting item state on error
        }
    };

    // Dropdown menu for action buttons (Edit, Delete, Print)
    const menu = (record) => (
        <Menu
            onClick={({ key }) => handleMenuClick(key, record)}
            items={[
                {
                    key: 'print',
                    label: (
                        <span
                            style={{
                                display: 'block',  // Ensures it covers the full width
                                padding: '2px 12px', // Adds padding for a larger clickable area
                                cursor: 'pointer',  // Change cursor to pointer
                                '&:hover': {
                                    backgroundColor: '#f5f5f5', // Background on hover
                                },
                            }}
                        >
                            Print
                        </span>
                    ),
                },
                {
                    key: 'edit',
                    label: (
                        <span
                            style={{
                                display: 'block',
                                padding: '2px 12px',
                                cursor: 'pointer',
                            }}
                        >
                            Edit
                        </span>
                    ),
                },
                {
                    key: 'delete',
                    label: (
                        <Popconfirm
                            title="Are you sure to delete this sale?"
                            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                            onConfirm={() => confirmDelete(record._id)} // Only delete after confirmation
                            okText="Yes"
                            cancelText="No"
                        >
                            <span
                                style={{
                                    display: 'block',   // Ensures it covers the full width
                                    padding: '2px 12px', // Adds padding for a larger clickable area
                                    color: 'red',       // Change text color to red
                                    cursor: 'pointer',  // Change cursor to pointer
                                    '&:hover': {
                                        backgroundColor: '#f5f5f5', // Background on hover
                                        border: '1px solid red', // Optional border on hover
                                    },
                                }}
                            >
                                Delete
                            </span>
                        </Popconfirm>
                    ),
                },
            ]}
        />
    );

    const columns = [
        {
            title: 'Serial',
            key: 'serial',
            render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'RV No.',
            dataIndex: 'rvNumber',
            key: 'rvNumber',
        },
        {
            title: 'Sell by',
            dataIndex: 'sellBy',
            key: 'sellBy',
        },
        {
            title: 'Mode',
            dataIndex: 'mode',
            key: 'mode',
        },
        {
            title: 'Airline Code',
            key: 'airlineCode',
            dataIndex: 'airlineCode',
        },
        {
            title: 'Document No.',
            key: 'documentNumber',
            dataIndex: 'documentNumber',
        },
        {
            title: 'Vendor Name',
            key: 'supplierName',
            dataIndex: 'supplierName',
        },
        {
            title: 'Remarks',
            key: 'remarks',
            dataIndex: 'remarks',
        },
        {
            title: 'Status',
            key: 'postStatus',
            dataIndex: 'postStatus',
            render: (status, record) => {
                if (!status) {
                    return <Tag color="default" className='font-bold'>UNKNOWN</Tag>;
                }

                let color;
                if (status === 'Pending') {
                    color = 'red';
                } else if (status === 'Posted') {
                    color = 'green';
                }
                return (
                    <Tag
                        color={color}
                        key={status}
                        className='font-bold'
                        onClick={() => updatePostStatus(record._id, status)}
                        style={{ cursor: 'pointer' }}
                    >
                        {status.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: 'Payment',
            key: 'paymentStatus',
            dataIndex: 'paymentStatus',
            render: (status, record) => {
                if (!status) {
                    return <Tag color="default" className='font-bold'>UNKNOWN</Tag>;
                }

                let color;
                if (status === 'Due') {
                    color = 'red';
                } else if (status === 'Paid') {
                    color = 'green';
                }
                return (
                    <Tag
                        color={color}
                        key={status}
                        className='font-bold'
                        onClick={() => updatePaymentStatus(record._id, status, record.postStatus)}
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
                <Dropdown overlay={menu(record)} trigger={['click']}>
                    <Button>
                        Actions <DownOutlined />
                    </Button>
                </Dropdown>
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
                    <h2 className='text-2xl md:text-4xl font-bold'>Manage Sales</h2>
                </div>
            </Header>
            <Content
                style={marginStyle}
            >
                <Breadcrumb
                    style={{ margin: '16px 0' }}
                >
                    <Breadcrumb.Item>Sales</Breadcrumb.Item>
                    <Breadcrumb.Item>Manage Sales</Breadcrumb.Item>
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
                        dataSource={flattenedSales}  // Use the flattened sales data
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

export default ManageSales;

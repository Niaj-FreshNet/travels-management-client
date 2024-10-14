import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Dropdown, Form, Input, Layout, Menu, message, notification, Popconfirm, Select, Space, Spin, Table, Tag, theme } from 'antd';
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import useSales from '../../../Hooks/useSales';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import './styles.css';
import { NavLink, useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import useAdmin from '../../../Hooks/useAdmin';
import EditSale from './EditSales';
import PrintModal from './PrintModal';
import RefundSale from './RefundSale';
import { BiRefresh } from 'react-icons/bi';
import { IoDocumentTextSharp } from 'react-icons/io5';

const { Header, Content } = Layout;

const ManageSales = () => {
    const { sales, refetch, isLoading, isError, error } = useSales();
    const [isAdmin, isAdminLoading] = useAdmin();

    const axiosUser = useAxiosUser();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
    const [deletingItemId, setDeletingItemId] = useState(null);
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [flattenedSales, setFlattenedSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredSales, setFilteredSales] = useState([]);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [isRefundModalVisible, setIsRefundModalVisible] = useState(false);
    const [triggerPrint, setTriggerPrint] = useState(false);

    useEffect(() => {
        // Check if sales is a valid array
        if (sales && Array.isArray(sales)) {
            // Flatten the nested sales data
            const flatSales = sales.flatMap(sale => {
                // Ensure sale.sales is an array before mapping
                if (Array.isArray(sale.sales)) {
                    return sale.sales.map(saleItem => ({
                        _id: sale._id,   // Retain the main sale document's ID
                        // Access the nested sales array data
                        sellBy: saleItem.sellBy,
                        mode: saleItem.mode,
                        rvNumber: saleItem.rvNumber,
                        airlineCode: saleItem.airlineCode,
                        iataName: saleItem.iataName,
                        documentNumber: saleItem.documentNumber,
                        supplierName: saleItem.supplierName,
                        accountType: saleItem.accountType,
                        sellPrice: saleItem.sellPrice,
                        buyingPrice: saleItem.buyingPrice,
                        remarks: saleItem.remarks,
                        passengerName: saleItem.passengerName,
                        sector: saleItem.sector,
                        date: saleItem.date,
                        postStatus: saleItem.postStatus,
                        paymentStatus: saleItem.paymentStatus,
                        saveAndPost: saleItem.saveAndPost,
                        isRefunded: saleItem.isRefunded,
                    }));
                }
                return []; // Return an empty array if sale.sales is not an array
            });


            setFlattenedSales(flatSales); // Set the flattened sales data
            setFilteredSales(flatSales); // Also set filteredSales to the flattened sales data
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

    // const handleSearch = async (values) => {
    //     const { query } = values;

    //     setLoading(true); // Start loading
    //     const lowercasedValue = query.toLowerCase();

    //     // Filter flattened sales data based on the search query
    //     const filteredData = flattenedSales.filter(sale =>
    //         Object.values(sale).some(field =>
    //             String(field).toLowerCase().includes(lowercasedValue)
    //         )
    //     );

    //     setFilteredSales(filteredData); // Update filtered sales data
    //     setLoading(false); // Stop loading
    // };

    // Function to handle search as user types
    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setLoading(true);

        // Filter flattened sales data based on the search query
        const filteredData = flattenedSales.filter(sale =>
            Object.values(sale).some(field =>
                String(field).toLowerCase().includes(query)
            )
        );

        setFilteredSales(filteredData); // Update filtered sales data
        setLoading(false);
    };

    // const updatePostStatus = async (id, postStatus) => {
    //     try {
    //         const newStatus = postStatus === 'Pending' ? 'Posted' : 'Pending';
    //         // await axiosUser.put(`/sale/${id}/postStatus`, { postStatus: newStatus });
    //         await axiosSecure.put(`/sale/${id}/postStatus`, { postStatus: newStatus });
    //         message.success('Post Status updated successfully');
    //         refetch();
    //     } catch (err) {
    //         console.error('Error updating Post Status:', err);
    //         message.error('Failed to update Post Status');
    //     }
    // };

    const updatePostStatus = async (id, documentNumber, postStatus) => {
        // // Check if paymentStatus is "Due"
        // if (paymentStatus === 'Paid') {
        //     message.warning('Post status cannot be changed with Due payment');
        //     return;
        // }
        // Check if postStatus is "Refunded"
        if (postStatus === 'Refunded') {
            message.warning('This sale has been refunded');
            return;
        }
        try {
            const newStatus = postStatus === 'Pending' ? 'Posted' : 'Pending';
            // await axiosSecure.put(`/sale/${id}/postStatus`, { documentNumber, postStatus: newStatus });
            await axiosSecure.patch(`/sale/${id}/postStatus`, { documentNumber, postStatus: newStatus });

            // Refetch data after update
            refetch();

            message.success('Post Status updated successfully');
        } catch (err) {
            console.error('Error updating Post Status:', err);
            message.error('Failed to update Post Status');
        }
    };

    const updatePaymentStatus = async (id, documentNumber, paymentStatus, postStatus) => {
        // Check if postStatus is "Pending"
        if (postStatus === 'Pending') {
            message.warning('Cannot change Payment Status while Post Status is Pending');
            return;
        }
        try {
            const newPayment = paymentStatus === 'Due' ? 'Paid' : 'Due';
            // await axiosSecure.put(`/sale/${id}/paymentStatus`, { documentNumber, paymentStatus: newPayment });
            await axiosSecure.patch(`/sale/${id}/paymentStatus`, { documentNumber, paymentStatus: newPayment });
            refetch();
            message.success('Payment Status updated successfully');
        } catch (err) {
            message.error('Failed to update Payment Status');
        }
    };

    // Handle the deletion of a sale only after confirmation
    const confirmDelete = async (key, record, id) => {
        // Check if the sale is saved and posted
        if ((key === 'delete') && record.saveAndPost === "Yes" && !isAdmin) {
            notification.warning({
                message: 'Action Not Allowed',
                description: 'This sale cannot be deleted as it has been saved and posted.',
                placement: 'topRight',
                duration: 3, // Duration in seconds
            });
            return; // Exit the function to prevent further actions
        }
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
        setConfirmDeleteVisible(false); // Hide the Popconfirm after deletion
    };
    const handleMenuClick = async (key, record) => {
        // Check if the sale is saved and posted
        if ((key === 'edit') && record.saveAndPost === "Yes" && !isAdmin) {
            notification.warning({
                message: 'Action Not Allowed',
                description: 'This sale cannot be edited as it has been saved and posted.',
                placement: 'topRight',
                duration: 3, // Duration in seconds
            });
            return; // Exit the function to prevent further actions
        }
        if ((key === 'refund') && record.postStatus === "Pending" && record.paymentStatus === 'Due') {
            notification.warning({
                message: 'This sale has not been Paid and Posted',
                description: 'Only Paid and Posted sales can be refunded',
                placement: 'topRight',
                duration: 3, // Duration in seconds
            });
            return; // Exit the function to prevent further actions
        }
        if ((key === 'refund') && record.isRefunded === "Yes") {
            notification.warning({
                message: 'This sale already has been refunded',
                description: 'Check refund list to show refunded sales',
                placement: 'topRight',
                duration: 3, // Duration in seconds
            });
            return; // Exit the function to prevent further actions
        }

        switch (key) {
            case 'print':
                // handlePrint(record); // Define this function as needed
                setLoading(true);
                setSelectedSale(record);
                setIsPrintModalVisible(true);
                break;
            case 'edit':
                setLoading(true);
                setSelectedSale(record);
                setIsEditModalVisible(true);
                break;
            case 'refund':
                setSelectedSale(record); // Store the record to possibly use in RefundSale
                setIsRefundModalVisible(true); // Open RefundSale modal
                break;
            case 'delete':
                // Open Popconfirm for deletion
                break;
            default:
                break;
        }
    };

    // Dropdown menu for action buttons (Edit, Delete, Print)
    const menu = (record) => (
        <Menu>
            <Menu.Item key="print" onClick={() => handleMenuClick('print', record)}>
                <span style={{ cursor: 'pointer' }}>Print</span>
            </Menu.Item>
            <Menu.Item key="edit" onClick={() => handleMenuClick('edit', record)}>
                <span style={{ cursor: 'pointer' }}>Edit</span>
            </Menu.Item>
            <Menu.Item key="refund" onClick={() => handleMenuClick('refund', record)}>
                <span style={{ cursor: 'pointer' }}>Refund</span>
            </Menu.Item>
            <Menu.Item key="delete">
                <Popconfirm
                    title="Are you sure to delete this sale?"
                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                    onConfirm={() => confirmDelete('edit', record, record._id)} // Only delete after confirmation
                    okText="Yes"
                    cancelText="No"
                >
                    <span style={{ color: 'red', cursor: 'pointer' }}>Delete</span>
                </Popconfirm>
            </Menu.Item>
        </Menu>
    );

    const handleEditModalClose = () => {
        setIsEditModalVisible(false);
        setSelectedSale(null);
        setLoading(false);
    };

    const handlePrintModalClose = () => {
        setIsPrintModalVisible(false);
        setSelectedSale(null);
        setLoading(false);
    };

    const handleRefresh = () => {
        setLoading(true);
        refetch()
            .then(() => {
                setLoading(false);
                message.success('Data refreshed successfully');
            })
            .catch(() => {
                setLoading(false);
                message.error('Failed to refresh data');
            });
    };


    const columns = [
        {
            title: 'Serial',
            key: 'serial',
            align: 'center',
            render: (_, __, index) => (currentPage - 1) * 25 + index + 1,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            align: 'center',
        },
        {
            title: 'RV No.',
            dataIndex: 'rvNumber',
            key: 'rvNumber',
            align: 'center',
        },
        {
            title: 'Sell by',
            dataIndex: 'sellBy',
            key: 'sellBy',
            align: 'center',
        },
        {
            title: 'Mode',
            dataIndex: 'mode',
            key: 'mode',
            align: 'center',
        },
        {
            title: 'A/C',
            key: 'airlineCode',
            dataIndex: 'airlineCode',
            align: 'center',
        },
        {
            title: 'Document No.',
            key: 'documentNumber',
            dataIndex: 'documentNumber',
            align: 'center',
        },
        {
            title: 'Vendor Name',
            key: 'supplierName',
            dataIndex: 'supplierName',
            align: 'center',
        },
        {
            title: 'Remarks',
            key: 'remarks',
            dataIndex: 'remarks',
            align: 'center',
        },
        {
            title: 'Status',
            key: 'postStatus',
            dataIndex: 'postStatus',
            align: 'center',
            render: (status, record) => {
                if (!status) {
                    return <Tag color="default" className='font-semibold'>UNKNOWN</Tag>;
                }

                let color;
                if (status === 'Pending') {
                    color = 'red';
                } else if (status === 'Posted') {
                    color = 'green';
                } else if (status === 'Refunded') {
                    color = 'blue';
                }
                return (
                    <Tag
                        color={color}
                        key={status}
                        className='text-base font-bold'
                        onClick={() => updatePostStatus(record._id, record.documentNumber, status)}
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
            align: 'center',
            render: (status, record) => {
                if (!status) {
                    return <Tag color="default" className='font-semibold'>UNKNOWN</Tag>;
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
                        className='text-base font-bold'
                        onClick={() => updatePaymentStatus(record._id, record.documentNumber, status, record.postStatus)}
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
                    items={[
                        {
                            title: 'Sales',
                        },
                        {
                            title: 'Manage Sales',
                        },
                    ]}
                />

                <Form
                    layout="inline"
                    className='flex justify-start gap-0 px-2 pt-2 pb-4 md:pb-6'
                    form={form}
                    onFinish={handleSearch} // Trigger search on form submission
                >
                    <Form.Item name="query" rules={[{ required: false, message: 'Please input your search query!' }]}>
                        <Input.Search
                            placeholder="Search by anything..."
                            style={{
                                width: '300px',
                                outlineColor: 'blue',
                                borderColor: 'lightblue',
                                borderRadius: '4px',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                transition: 'border-color 0.3s, box-shadow 0.3s',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'blue';
                                e.target.style.boxShadow = '0 0 5px rgba(0, 0, 255, 0.5)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'lightblue';
                                e.target.style.boxShadow = 'none';
                            }}
                            onChange={handleSearch} // Add onChange handler
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Search</Button>
                    </Form.Item>
                    <Button onClick={handleRefresh}>
                        <BiRefresh size={24} />
                    </Button>
                </Form>

                <Spin spinning={loading}>

                    <div
                        style={{
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Table
                            rowKey="_id"
                            columns={columns}
                            dataSource={filteredSales} // Use filteredSales instead of flattenedSales
                            pagination={{
                                current: currentPage,
                                defaultPageSize: 25,
                                showSizeChanger: true,
                                pageSizeOptions: ['25', '50', '100'],
                                onChange: (page, size) => {
                                    setCurrentPage(page);
                                    setPageSize(size);
                                },
                            }}
                            bordered
                            scroll={{ x: 'max-content' }} // Enable horizontal scroll if needed
                            locale={{
                                emptyText: loading ? (
                                    <div
                                        className="flex flex-col justify-center items-center"
                                        style={{ height: '100%', textAlign: 'center' }}
                                    >
                                        <Spin size="large" />
                                        <p style={{ marginTop: '16px', fontSize: '18px', color: '#888' }}>
                                            Loading data...
                                        </p>
                                    </div>
                                ) : (
                                    <div
                                        className="flex flex-col justify-center items-center my-10"
                                        style={{ height: '100%', textAlign: 'center' }}
                                    >
                                        <IoDocumentTextSharp size={90} />
                                        <p style={{ fontSize: '18px', color: '#888' }}>
                                            Loading data...
                                        </p>
                                    </div>
                                )
                            }}
                        />
                    </div>
                </Spin>

                {selectedSale && (
                    <EditSale
                        visible={isEditModalVisible}
                        onClose={handleEditModalClose}
                        saleData={selectedSale}
                        refetch={refetch}
                        loading={loading}
                        setLoading={setLoading}
                    />
                )}

                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <Spin />
                    </div>
                )}

                <RefundSale
                    refetch={refetch}
                    visible={isRefundModalVisible}
                    onClose={() => setIsRefundModalVisible(false)}
                    selectedSale={selectedSale}
                />

                {/* PrintManager Component */}
                {/* <PrintSale saleData={selectedSale} triggerPrint={triggerPrint} /> */}
                {selectedSale && (
                    <PrintModal
                        visible={isPrintModalVisible}
                        onClose={handlePrintModalClose}
                        saleData={selectedSale}
                        refetch={refetch}
                        loading={loading}
                        setLoading={setLoading}
                    />
                )}
            </Content>
        </>
    );
};

export default ManageSales;

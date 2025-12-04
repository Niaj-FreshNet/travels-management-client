import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Dropdown, Form, Input, Layout, Menu, message, notification, Popconfirm, Select, Space, Spin, Table, Tag, theme } from 'antd';
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import useSales from '../../../Hooks/useSales';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import './styles.css';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import useAdmin from '../../../Hooks/useAdmin';
import EditSale from './EditSales';
import PrintModal from './PrintModal';
import RefundSale from './RefundSale';
import { BiRefresh } from 'react-icons/bi';
import { IoDocumentTextSharp } from 'react-icons/io5';
import useIsSuperAdmin from '../../../Hooks/useIsSuperAdmin';
import useSuppliers from '../../../Hooks/useSuppliers';

const { Header, Content } = Layout;

const ManageSales = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [searchQuery, setSearchQuery] = useState('');
    const { sales, pagination, refetch, isLoading, isError, error } = useSales(currentPage, pageSize, searchQuery);
    const { suppliers } = useSuppliers();
    const [isAdmin, isAdminLoading] = useAdmin();
    const [isSuperAdmin, isSuperAdminLoading] = useIsSuperAdmin();

    const axiosSecure = useAxiosSecure();
    const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
    const [deletingItemId, setDeletingItemId] = useState(null);
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [flattenedSales, setFlattenedSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [filteredSales, setFilteredSales] = useState([]);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [isRefundModalVisible, setIsRefundModalVisible] = useState(false);
    const [rawData, setRawData] = useState([]);

    useEffect(() => {
        if (sales && Array.isArray(sales)) {
            const flatSales = sales.map(sale => ({
                id: sale.id,
                sellBy: sale.sellBy,
                officeId: sale.officeId,
                officeName: sale.officeName,
                mode: sale.mode,
                rvNumber: sale.rvNumber,
                airlineCode: sale.airlineCode,
                iataName: sale.iataName,
                documentNumber: sale.documentNumber,
                supplierName: sale.supplierName,
                accountType: sale.accountType,
                sellPrice: sale.sellPrice,
                buyingPrice: sale.buyingPrice,
                remarks: sale.remarks,
                passengerName: sale.passengerName,
                sector: sale.sector,
                date: sale.date,
                postStatus: sale.postStatus,
                paymentStatus: sale.paymentStatus,
                saveAndPost: sale.saveAndPost,
                isRefunded: sale.isRefunded,
                createdAt: sale.createdAt,
            }));

            flatSales.sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                if (dateA === dateB) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                return dateB - dateA;
            });

            setFlattenedSales(flatSales);
            setFilteredSales(flatSales);
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

    // const handleSearch = (event) => {
    //     const query = event.target.value.toLowerCase().trim();
    //     setLoading(true);

    //     // Check if the query is a document number or RV number search
    //     const isDocumentNumberSearch = flattenedSales.some(sale =>
    //         sale.documentNumber && sale.documentNumber.toLowerCase() === query
    //     );
    //     const isRvNumberSearch = flattenedSales.some(sale =>
    //         sale.rvNumber && (sale.rvNumber.toLowerCase() === query || sale.rvNumber.toLowerCase().includes(query)) // Allow partial matches for RV number
    //     );

    //     // Filter flattened sales data based on the search query
    //     const filteredData = flattenedSales.filter(sale => {
    //         if (isDocumentNumberSearch || isRvNumberSearch) {
    //             // If the search is for a document number or rv number, check for exact matches
    //             return (
    //                 (sale.documentNumber && sale.documentNumber.toLowerCase() === query) ||
    //                 (sale.rvNumber && (sale.rvNumber.toLowerCase() === query || sale.rvNumber.toLowerCase().includes(query))) // Ensure rvNumber exists
    //             );
    //         }

    //         // If it's a general search, check all relevant fields for partial matches
    //         return [
    //             sale.airlineCode,
    //             sale.iataName,
    //             sale.supplierName,
    //             sale.accountType,
    //             sale.sellPrice,
    //             sale.buyingPrice,
    //             sale.remarks,
    //             sale.passengerName,
    //             sale.sector,
    //             sale.date,
    //             sale.postStatus,
    //             sale.paymentStatus
    //         ].some(field => field && String(field).toLowerCase().includes(query));
    //     });

    //     setFilteredSales(filteredData); // Update filtered sales data
    //     setLoading(false);
    // };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value.trim());
        setCurrentPage(1); // reset to first page on new search
    };

    const updatePostStatus = async (id, documentNumber, postStatus) => {
        // Check if postStatus is "Refunded"
        if (postStatus === 'Refunded') {
            message.warning('This sale has been refunded');
            return;
        }

        try {
            // Determine the new status
            const newStatus = postStatus === 'Pending' ? 'Posted' : 'Posted';

            // Update the post status in the backend
            await axiosSecure.patch(`/sales/${id}/postStatus`, { documentNumber, postStatus: newStatus });

            // Refetch data after update
            refetch();

            message.success('Post Status updated successfully');
        } catch (err) {
            console.error('Error updating Post Status:', err);
            message.warning('The Status is marked as "Posted"');
        }
    };

    const updatePaymentStatus = async (id, documentNumber, paymentStatus, postStatus) => {
        // Check if postStatus is "Pending"
        if (postStatus === 'Pending') {
            message.warning('Cannot change Payment Status while Post Status is Pending');
            return;
        }

        try {
            // Toggle payment status between 'Due' and 'Paid'
            const newPaymentStatus = paymentStatus === 'Due' ? 'Paid' : 'Paid';

            // Call the updated API endpoint
            await axiosSecure.patch(`/sales/${id}/paymentStatus`, { documentNumber, paymentStatus: newPaymentStatus });

            // Refetch the data after update
            refetch();

            message.success('Payment Status updated successfully');
        } catch (err) {
            console.error('Error updating Payment Status:', err);
            message.warning('Payment Status is marked as "Paid"');
        }
    };

    // Handle the deletion of a sale only after confirmation
    const confirmDelete = async (key, record, id, supplierName) => {
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


            // Retrieve the payment details to get the paidAmount
            const buyingPriceResponse = await axiosSecure.get(`/sales/${id}`);
            const buyingPrice = buyingPriceResponse.data.buyingPrice || 0;

            // Retrieve the supplier's totalDue from the suppliers data
            const supplier = suppliers.find(supplier => supplier.supplierName === supplierName);
            const currentTotalDue = supplier ? supplier.totalDue : 0;

            // Calculate the updated totalDue
            const updatedTotalDue = currentTotalDue - Number(buyingPrice);

            // Update the supplier's totalDue in the database
            await axiosSecure.patch(`/suppliers/due/${supplierName}`, { totalDue: updatedTotalDue });

            await axiosSecure.delete(`/sales/${id}`);

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
        // console.log(key, record)
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
        // if ((key === 'edit') && record.isRefunded === "Yes" && !isAdmin) {
        //     notification.warning({
        //         message: 'Action Not Allowed',
        //         description: 'This sale cannot be edited as it has been saved and posted.',
        //         placement: 'topRight',
        //         duration: 3, // Duration in seconds
        //     });
        //     return; // Exit the function to prevent further actions
        // }
        if ((key === 'refund') && record.postStatus === "Pending") {
            notification.warning({
                message: 'Action Not Allowed',
                description: 'Only Paid and Posted sales can be refunded',
                placement: 'topRight',
                duration: 3, // Duration in seconds
            });
            return; // Exit the function to prevent further actions
        }
        if ((key === 'refund') && record.paymentStatus === "Due") {
            notification.warning({
                message: 'Action Not Allowed',
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
                    onConfirm={() => confirmDelete('delete', record, record.id, record.supplierName)} // Only delete after confirmation
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

    // const handleReset = () => {
    //     setSearchQuery(''); // Clear the search query
    //     setFilteredSales(flattenedSales); // Reset to original sales data
    //     setLoading(false); // Stop loading
    // };

    // Function to refresh data
    const handleRefresh = () => {
        setLoading(true);
        refetch()
            .then((data) => {
                // Assuming refetch returns the new data. 
                if (Array.isArray(data)) {
                    setRawData(data);
                    setFilteredSales(data); // Reset the filtered sales to the new data
                } else {
                    console.error('Fetched data is not an array:', data);
                    setRawData([]);
                }
                setLoading(false);
                message.success('Data refreshed successfully');
            })
            .catch((error) => {
                setLoading(false);
                message.error('Failed to refresh data');
                console.error('Error fetching data:', error);
            });
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
            sorter: (a, b) => new Date(b.date) - new Date(a.date),
        },
        {
            title: 'RV No.',
            dataIndex: 'rvNumber',
            key: 'rvNumber',
            align: 'center',
            sorter: (a, b) => a.rvNumber.localeCompare(b.rvNumber),
        },
        {
            title: 'Sell by',
            dataIndex: 'sellBy',
            key: 'sellBy',
            align: 'center',
            sorter: (a, b) => a.sellBy.localeCompare(b.sellBy),
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
            sorter: (a, b) => a.supplierName.localeCompare(b.supplierName),
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
            sorter: (a, b) => a.postStatus.localeCompare(b.postStatus),
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
                        onClick={() => updatePostStatus(record.id, record.documentNumber, status)}
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
            sorter: (a, b) => a.paymentStatus.localeCompare(b.paymentStatus),
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
                        onClick={() => updatePaymentStatus(record.id, record.documentNumber, status, record.postStatus)}
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
                    onFinish={handleSearchChange} // Trigger search on form submission
                >
                    <Form.Item name="query" rules={[{ required: false, message: 'Please input your search query!' }]}>
                        <Input.Search
                            placeholder="Search by anything..."
                            style={{
                                width: '350px',
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
                            value={searchQuery}
                            onChange={handleSearchChange} // Add onChange handler
                        />
                        <Button
                            type="default"
                            // onClick={handleReset}
                            style={{ marginLeft: '8px' }}
                        >
                            <a href="">Reset</a>
                        </Button>
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
                            rowKey="id"
                            columns={columns}
                            dataSource={filteredSales} // Use filteredSales instead of flattenedSales
                            loading={isLoading || loading}
                            pagination={{
                                current: currentPage,
                                pageSize: pageSize,
                                total: pagination.total,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50', '100'],
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

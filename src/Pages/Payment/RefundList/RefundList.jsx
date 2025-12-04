import { useEffect, useState } from 'react';
import { Breadcrumb, Button, Layout, message, Popconfirm, Space, Table, theme } from 'antd';
import { QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import useSuppliers from '../../../Hooks/useSuppliers';
import useRefundSales from '../../../Hooks/useRefundSales';

const { Header, Content } = Layout;

const RefundList = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [searchQuery, setSearchQuery] = useState('');
    const { data, refetch, isLoading } = useRefundSales(currentPage, pageSize, searchQuery);
    const { suppliers } = useSuppliers();


    const axiosSecure = useAxiosSecure();
    const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
    const [recoveringItemId, setRecoveringItemId] = useState(null);
    const [accountType, setAccountType] = useState({});
    const [totalDue, setTotalDue] = useState({});

    const flattenedSales = data?.data || [];
    const pagination = data?.pagination || {};

    useEffect(() => {
        if (suppliers) {
            // Create account type and total due mapping by supplier name
            const accountTypeMapping = {};
            const totalDueMapping = {};

            suppliers.forEach((supplier) => {
                accountTypeMapping[supplier.supplierName] = supplier.accountType;
                totalDueMapping[supplier.supplierName] = supplier.totalDue;
            });

            setAccountType(accountTypeMapping);
            setTotalDue(totalDueMapping);
        }
    }, [suppliers]);

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


    const handleRecover = async (id, documentNumber, isRefunded, postStatus, supplierName, refundAmount) => {
        try {
            const notRefunded = 'No';
            await axiosSecure.patch(`/sales/${id}/notRefund`, { documentNumber, isRefunded: notRefunded });

            const newStatus = 'Pending';
            await axiosSecure.patch(`/sales/${id}/refundStatus`, { documentNumber, postStatus: newStatus });

            const previousTotalDue = Number(totalDue[supplierName]) || 0;
            let updatedTotalDue = previousTotalDue;

            // Reverse the calculation based on account type
            if (accountType[supplierName] === 'Credit') {
                updatedTotalDue += refundAmount; // Add back the refund amount
            } else if (accountType[supplierName] === 'Debit') {
                // CHANGED THE SIGN - TO + at 17-10-24
                updatedTotalDue += refundAmount; // Subtract the refund amount
            }

            // Update the supplier's total due amount
            await axiosSecure.patch(`/suppliers/due/${supplierName}`, { totalDue: updatedTotalDue });

            message.success('The sale has been recovered');
            setTimeout(() => {
                refetch();
                setRecoveringItemId(null); // Clear the recovering item state after refetch
            }, 500); // Delay refetch to allow for animation
        } catch (err) {
            console.error('Error recovering sale:', err);
            message.error('Failed to recover sale');
            setRecoveringItemId(null); // Clear the recovering item state on error
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
            title: 'Ticket Code',
            dataIndex: 'airlineCode',
            key: 'airlineCode',
            align: 'center',
        },
        {
            title: 'Agent Name',
            dataIndex: 'sellBy',
            key: 'sellBy',
            align: 'center',
        },
        {
            title: 'Document No.',
            key: 'documentNumber',
            dataIndex: 'documentNumber',
            align: 'center',
        },
        {
            title: 'Net Price',
            dataIndex: 'buyingPrice',
            key: 'buyingPrice',
            align: 'center',
        },
        {
            title: 'Vendor Name',
            key: 'supplierName',
            dataIndex: 'supplierName',
            align: 'center',
        },
        {
            title: 'Vendor Charges',
            key: 'refundCharge',
            dataIndex: 'refundCharge',
            align: 'center',
        },
        {
            title: 'Service Charges',
            key: 'serviceCharge',
            dataIndex: 'serviceCharge',
            align: 'center',
        },
        {
            title: 'Refund to Pax',
            key: 'refundFromAirline',
            dataIndex: 'refundFromAirline',
            align: 'center',
        },
        {
            title: 'Refund from Vendor',
            key: 'refundAmount',
            dataIndex: 'refundAmount',
            align: 'center',
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Popconfirm
                        title="Recover the sale"
                        description="Are you sure to recover this sale?"
                        icon={
                            <QuestionCircleOutlined
                                style={{ color: 'red' }}
                            />
                        }
                        onConfirm={() => handleRecover(record.id, record.documentNumber, record.isRefunded, record.postStatus, record.supplierName, record.refundAmount)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="primary"
                            error
                            loading={recoveringItemId === record.id} // Show loading spinner if deleting
                        >
                            <ReloadOutlined />
                            Recover
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
                    <h2 className='text-2xl md:text-4xl font-bold'>Refund List</h2>
                </div>
            </Header>
            <Content
                style={marginStyle}
            >
                <Breadcrumb
                    style={{ margin: '16px 0' }}
                    items={[
                        {
                            title: 'Payments',
                        },
                        {
                            title: 'Refund List',
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
                        dataSource={flattenedSales}
                        loading={isLoading}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            pageSizeOptions: ["10", "20", "50", "100"],
                            onChange: (page, size) => {
                                setCurrentPage(page);
                                setPageSize(size);
                            },
                        }}
                        rowKey={(record) => record.id}
                        bordered
                        scroll={{ x: 'max-content' }} // Enable horizontal scroll if needed
                    />

                </div>
            </Content>
        </>
    );
};

export default RefundList;

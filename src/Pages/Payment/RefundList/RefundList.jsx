import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Dropdown, Layout, Menu, message, Popconfirm, Space, Table, Tag, theme } from 'antd';
import { DownOutlined, QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import EditAirline from '../../Airlines/EditAirline';
import useSales from '../../../Hooks/useSales';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import useAirlines from '../../../Hooks/useAirlines';
import { useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import useSuppliers from '../../../Hooks/useSuppliers';

const { Header, Content } = Layout;

const RefundList = () => {
    // const { airlines } = useAirlines();
    const { sales, refetch, isLoading, isError, error } = useSales();
    const { suppliers } = useSuppliers();


    const axiosUser = useAxiosUser();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
    const [recoveringItemId, setRecoveringItemId] = useState(null);
    const [flattenedSales, setFlattenedSales] = useState([]);
    const [accountType, setAccountType] = useState({});
    const [totalDue, setTotalDue] = useState({});

    useEffect(() => {
        // Check if sales is a valid array
        if (sales && Array.isArray(sales)) {
            // Flatten the nested sales data
            const flatSales = sales.flatMap(sale => {
                // Ensure sale.sales is an array before mapping
                if (Array.isArray(sale.sales)) {
                    return sale.sales
                        .filter(saleItem => saleItem.isRefunded === 'Yes')
                        .map(saleItem => ({
                            _id: sale._id,   // Retain the main sale document's ID
                            // Access the nested sales array data
                            sellBy: sale.sellBy,
                            mode: sale.mode,
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
                            refundCharge: saleItem.refundCharge,
                            serviceCharge: saleItem.serviceCharge,
                            refundFromAirline: saleItem.refundFromAirline,
                            refundAmount: saleItem.refundAmount,
                            postStatus: saleItem.postStatus,
                            paymentStatus: saleItem.paymentStatus,
                            saveAndPost: saleItem.saveAndPost,
                            isRefunded: saleItem.isRefunded,
                        }));
                }
                return []; // Return an empty array if sale.sales is not an array
            });


            setFlattenedSales(flatSales); // Set the flattened sales data
        }
    }, [sales]);
    
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
            await axiosUser.patch(`/sale/${id}/notRefund`, { documentNumber, isRefunded: notRefunded })

            const newStatus = 'Pending';
            await axiosUser.patch(`/sale/${id}/refundStatus`, { documentNumber, postStatus: newStatus });


            // Check if the supplier account type credit or debit
            // const supplierName = supplierName;
            const previousTotalDue = Number(totalDue[supplierName]) || 0;
            let updatedTotalDue = previousTotalDue;

            // Reverse the calculation based on account type
            if (accountType[supplierName] === 'Credit') {
                updatedTotalDue += refundAmount; // Add back the refund amount
            } else if (accountType[supplierName] === 'Debit') {
                updatedTotalDue -= refundAmount; // Subtract the refund amount
            }

            // Update the supplier's total due amount
            await axiosUser.patch(`/supplier/${supplierName}`, { totalDue: updatedTotalDue });
            
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
            render: (_, __, index) => (currentPage - 1) * 25 + index + 1,
        },
        {
            title: 'Ticket Code',
            dataIndex: 'documentNumber',
            key: 'documentNumber',
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
                        onConfirm={() => handleRecover(record._id, record.documentNumber, record.isRefunded, record.postStatus, record.supplierName, record.refundAmount)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="primary"
                            error
                            loading={recoveringItemId === record._id} // Show loading spinner if deleting
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
                        dataSource={flattenedSales}  // Use the flattened sales data
                        loading={isLoading}
                        rowKey="_id"
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
                    />
                </div>
            </Content>
        </>
    );
};

export default RefundList;

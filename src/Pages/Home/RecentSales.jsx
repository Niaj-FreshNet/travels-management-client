import { Card, Col, Layout, Row, Table, Tag, theme } from 'antd';
import ManageSales from '../Sales/ManageSales/ManageSales';
import { useEffect, useState } from 'react';
import useSales from '../../Hooks/useSales';
import { BiLinkExternal } from 'react-icons/bi';
import { NavLink } from 'react-router-dom';


const { Header, Content } = Layout;

const RecentSales = () => {
    const { sales, refetch, isLoading, isError, error } = useSales();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
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

    const columns = [
        {
            title: 'RV No.',
            dataIndex: 'rvNumber',
            key: 'rvNumber',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
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
        }
    ];

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();


    return (
        <Content
            style={{
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
                padding: 8,
                borderWidth: '2px',
                borderColor: 'white',
                borderRadius: '1rem', // 16px
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
        >
            <div className='flex items-baseline'>
                <h3 className="text-2xl font-bold px-4 pt-2 pb-4">Recent Sales</h3>
                <NavLink to="/sales/manage" >
                    <div className="btn btn-outline btn-sm bg-gray">
                        <BiLinkExternal size={24} />
                    </div>
                </NavLink>
            </div>
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
    );
};
export default RecentSales;

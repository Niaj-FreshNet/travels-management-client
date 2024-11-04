import { Card, Col, Layout, message, Row, Table, Tag, theme, Typography } from 'antd';
import ManageSales from '../Sales/ManageSales/ManageSales';
import { useEffect, useState } from 'react';
import useSales from '../../Hooks/useSales';
import { BiLinkExternal } from 'react-icons/bi';
import { NavLink } from 'react-router-dom';
import useAxiosUser from '../../Hooks/useAxiosUser';
import useIsSuperAdmin from '../../Hooks/useIsSuperAdmin';


const { Header, Content } = Layout;

const RecentSales = () => {
    const axiosUser = useAxiosUser();
    const { sales, refetch, isLoading, isError, error } = useSales();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [flattenedSales, setFlattenedSales] = useState([]);
    const [isSuperAdmin, isSuperAdminLoading] = useIsSuperAdmin();

    useEffect(() => {
        // Check if sales is a valid array
        if (sales && Array.isArray(sales)) {
            // Directly map over the sales array
            const flatSales = sales.map(sale => ({
                _id: sale._id,   // Get the sale document's ID
                // Access the sale's properties directly
                sellBy: sale.sellBy,
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
                createdAt: sale.createdAt, // Include createdAt field
                createdBy: sale.createdBy,
                officeId: sale.officeId,
            }));

            // Sort the sales data by the time part of createdAt in descending order
            flatSales.sort((a, b) => {
                const timeA = new Date(a.createdAt).getTime(); // Get time in milliseconds
                const timeB = new Date(b.createdAt).getTime(); // Get time in milliseconds
                return timeB - timeA; // Sort in descending order
            });

            setFlattenedSales(flatSales); // Set the flattened sales data
        }
    }, [sales]);

    const columns = [
        {
            title: 'RV No.',
            dataIndex: 'rvNumber',
            key: 'rvNumber',
            align: 'center',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            align: 'center',
        },
        {
            title: 'Mode',
            dataIndex: 'mode',
            key: 'mode',
            align: 'center',
        },
        {
            title: 'Airline Code',
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
                        className='text-base font-bold'
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
                    pagination={false}
                    bordered
                    scroll={{ x: 'max-content' }} // Enable horizontal scroll if needed
                />
            </div>
        </Content>
    );
};
export default RecentSales;

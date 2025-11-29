import { Card, Col, Layout, message, Row, Table, Tag, theme, Typography } from 'antd';
import { useEffect, useState } from 'react';
import useSales from '../../Hooks/useSales';
import { BiLinkExternal } from 'react-icons/bi';
import { NavLink } from 'react-router-dom';
import useIsSuperAdmin from '../../Hooks/useIsSuperAdmin';

const { Header, Content } = Layout;

const RecentSales = () => {

    // ⬅️ Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(20);

    const { sales, pagination, refetch, isLoading, isError, error } = useSales(currentPage, limit);

    const [flattenedSales, setFlattenedSales] = useState([]);
    const [isSuperAdmin, isSuperAdminLoading] = useIsSuperAdmin();

    useEffect(() => {
        if (sales && Array.isArray(sales)) {
            const flatSales = sales.map(sale => ({
                _id: sale._id,
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
                createdAt: sale.createdAt,
                createdBy: sale.createdBy,
                officeId: sale.officeId,
            }));

            // Sort by createdAt → latest first
            flatSales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setFlattenedSales(flatSales);
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
            render: (status) => {
                let color = "default";
                if (status === 'Pending') color = 'red';
                if (status === 'Posted') color = 'green';
                if (status === 'Refunded') color = 'blue';

                return (
                    <Tag color={color} className='text-base font-bold'>
                        {(status || "UNKNOWN").toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: 'Payment',
            key: 'paymentStatus',
            dataIndex: 'paymentStatus',
            align: 'center',
            render: (status) => {
                let color = "default";
                if (status === 'Due') color = 'red';
                if (status === 'Paid') color = 'green';

                return (
                    <Tag color={color} className='text-base font-bold'>
                        {(status || "UNKNOWN").toUpperCase()}
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
                borderRadius: '1rem',
                boxShadow: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.1)',
            }}
        >
            <div className='flex items-baseline'>
                <h3 className="text-2xl font-bold px-4 pt-2 pb-4">Recent Sales</h3>
                <NavLink to="/sales/manage">
                    <div className="btn btn-outline btn-sm bg-gray">
                        <BiLinkExternal size={24} />
                    </div>
                </NavLink>
            </div>

            <div style={{ minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
                <Table
                    columns={columns}
                    dataSource={flattenedSales}
                    loading={isLoading}
                    rowKey="_id"
                pagination={{
                    current: currentPage,
                    pageSize: limit, // 🔥 Uses dynamic limit
                    total: pagination.total,
                    onChange: (page, newLimit) => {
                        setCurrentPage(page);
                        setLimit(newLimit); // 🔥 limit becomes dynamic
                    },
                    showSizeChanger: true
                }}
                    bordered
                    scroll={{ x: 'max-content' }}
                />
            </div>
        </Content>
    );
};

export default RecentSales;

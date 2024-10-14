import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, DatePicker, Form, Input, Layout, Select, Table, theme } from 'antd';
import useSales from '../../../Hooks/useSales';
import useUsers from '../../../Hooks/useUsers';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import { IoDocumentTextSharp } from 'react-icons/io5';

const { Header, Content } = Layout;

const ReportList = () => {
    const { sales, isLoading } = useSales();
    const { users } = useUsers();
    const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
    const [flattenedSales, setFlattenedSales] = useState([]);
    const [loading, setLoading] = useState(false);

    const [dateRange, setDateRange] = useState([null, null]);
    const [invoiceNo, setInvoiceNo] = useState('');
    const [userType, setUserType] = useState('All');
    const [filteredSales, setFilteredSales] = useState(flattenedSales);

    useEffect(() => {
        if (sales && Array.isArray(sales)) {
            const flatSales = sales.flatMap(sale => {
                if (sale.sales && Array.isArray(sale.sales)) {
                    return sale.sales.map(saleItem => ({
                        _id: sale._id,
                        date: sale.date,
                        rvNumber: sale.rvNumber,
                        sellBy: sale.sellBy,
                        mode: sale.mode,
                        postStatus: sale.postStatus,
                        paymentStatus: sale.paymentStatus,
                        airlineCode: saleItem.airlineCode,
                        iataName: saleItem.iataName,
                        documentNumber: saleItem.documentNumber,
                        supplierName: saleItem.supplierName,
                        sellPrice: Number(saleItem.sellPrice),
                        buyingPrice: Number(saleItem.buyingPrice),
                        remarks: saleItem.remarks,
                    }));
                }
                return [];
            });
            setFlattenedSales(flatSales);
            setFilteredSales(flatSales);
        }
    }, [sales]);

    const handleFilter = () => {
        let filtered = flattenedSales;

        if (Array.isArray(dateRange) && dateRange[0] && dateRange[1]) {
            const startDate = dayjs(dateRange[0]);
            const endDate = dayjs(dateRange[1]);
            filtered = filtered.filter(record => {
                const recordDate = dayjs(record.date);
                return recordDate.isBetween(startDate, endDate, null, '[]');
            });
        }

        if (invoiceNo) {
            filtered = filtered.filter(record => record.rvNumber.includes(invoiceNo));
        }

        if (userType !== 'All') {
            filtered = filtered.filter(record => record.sellBy === userType);
        }

        setFilteredSales(filtered);
    };

    useEffect(() => {
        handleFilter();
    }, [dateRange, invoiceNo, userType, flattenedSales]);

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

        handleResize();

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    dayjs.extend(customParseFormat);
    dayjs.extend(isBetween);

    const { RangePicker } = DatePicker;

    const dateFormat = 'YYYY-MM-DD';

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
        },
        {
            title: 'Passenger Name',
            dataIndex: 'mode',
            key: 'mode',
            align: 'center',
        },
        {
            title: 'Invoice No.',
            dataIndex: 'rvNumber',
            key: 'rvNumber',
            align: 'center',
        },
        {
            title: 'Ticket No.',
            key: 'documentNumber',
            dataIndex: 'documentNumber',
            align: 'center',
        },
        {
            title: 'Ticket Code',
            key: 'airlineCode',
            dataIndex: 'airlineCode',
            align: 'center',
        },
        {
            title: 'Supplier Name',
            key: 'supplierName',
            dataIndex: 'supplierName',
            align: 'center',
        },
        {
            title: 'Selling Price',
            key: 'sellPrice',
            dataIndex: 'sellPrice',
            align: 'center',
        },
        {
            title: 'Buying Price',
            key: 'buyingPrice',
            dataIndex: 'buyingPrice',
            align: 'center',
        },
        {
            title: 'Profit Margin',
            dataIndex: 'profit',
            key: 'profit',
            align: 'center',
            render: (text, record) => {
                const profit = record.sellPrice - record.buyingPrice;
                return profit ? profit.toFixed(2) : '0.00';
            },
        },
    ];

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const summaryRow = () => {
        const totalSellPrice = filteredSales.reduce((sum, record) => {
            const price = Number(record.sellPrice) || 0;
            return sum + price;
        }, 0).toFixed(2);

        const totalBuyingPrice = filteredSales.reduce((sum, record) => {
            const price = Number(record.buyingPrice) || 0;
            return sum + price;
        }, 0).toFixed(2);

        const totalProfit = filteredSales.reduce((sum, record) => {
            const sellPrice = Number(record.sellPrice) || 0;
            const buyingPrice = Number(record.buyingPrice) || 0;
            return sum + (sellPrice - buyingPrice);
        }, 0).toFixed(2);

        return (
            <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={7} align="left">
                    <strong>Total</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                    <strong>{totalSellPrice}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                    <strong>{totalBuyingPrice}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                    <strong>{totalProfit}</strong>
                </Table.Summary.Cell>
            </Table.Summary.Row>
        );
    };

    return (
        <>
            <Header
                className='flex justify-between items-center shadow-lg py-4 pl-4 pr-3 md:px-8'
                style={{ background: colorBgContainer }}
            >
                <div>
                    <h2 className='text-2xl md:text-4xl font-bold'>Calculate Profit</h2>
                </div>
            </Header>
            <Content style={marginStyle}>
                <Breadcrumb
                    style={{ margin: '16px 0' }}
                    items={[
                        {
                            title: 'Sales',
                        },
                        {
                            title: 'Report List',
                        },
                    ]}
                />

                <Form layout="inline" className='flex justify-start px-4 py-4 gap-2 md:pb-6'>
                    <Form.Item label={<b>Date</b>}>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates)}
                            style={{ width: 220 }}
                        />
                    </Form.Item>
                    <Form.Item label={<b>Invoice No.</b>}>
                        <Input
                            placeholder="Search by RV No."
                            value={invoiceNo}
                            onChange={(e) => setInvoiceNo(e.target.value)}
                            style={{ color: 'black', width: 200 }}
                        />
                    </Form.Item>
                    <Form.Item label={<b>User</b>}>
                        <Select
                            value={userType}
                            onChange={(value) => setUserType(value)}
                            style={{ width: 120 }}
                        >
                            <Select.Option value="All">All</Select.Option>
                            {users && users.map(user => (
                                <Select.Option key={user._id} value={user.name}>
                                    {user.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>

                <div
                    style={{
                        minHeight: 360,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Table
                        bordered
                        columns={columns}
                        dataSource={filteredSales}
                        loading={isLoading}
                        rowKey="_id"
                        pagination={{
                            defaultPageSize: 25,
                            showSizeChanger: true,
                            pageSizeOptions: ['25', '50', '100'],
                        }}
                        summary={summaryRow}
                        scroll={{ x: 'max-content' }}
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
            </Content>
        </>
    );
};

export default ReportList;
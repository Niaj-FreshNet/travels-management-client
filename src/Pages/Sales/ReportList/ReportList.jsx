import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, DatePicker, Dropdown, Form, Input, Layout, Menu, message, Popconfirm, Select, Space, Table, Tag, theme } from 'antd';
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import AddAirline from '../../Airlines/AddAirline';
import useSales from '../../../Hooks/useSales';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import useAirlines from '../../../Hooks/useAirlines';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';


const { Header, Content } = Layout;

const ReportList = () => {
    const { sales, refetch, isLoading, isError, error } = useSales();
    const axiosUser = useAxiosUser();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
    const [flattenedSales, setFlattenedSales] = useState([]);

    useEffect(() => {
        // Flatten the nested sales data after it's fetched
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
                        netPrice: Number(saleItem.netPrice),
                        remarks: saleItem.remarks,
                    }));
                }
                return [];
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

    dayjs.extend(customParseFormat);

    const { RangePicker } = DatePicker;

    const dateFormat = 'YYYY-MM-DD';

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
            title: 'Passenger Name',
            dataIndex: 'mode',
            key: 'mode'
        },
        {
            title: 'RV No.',
            dataIndex: 'rvNumber',
            key: 'rvNumber',
        },
        {
            title: 'Document No.',
            key: 'documentNumber',
            dataIndex: 'documentNumber',
        },
        {
            title: 'Airline Code',
            key: 'airlineCode',
            dataIndex: 'airlineCode',
        },
        {
            title: 'Vendor Name',
            key: 'supplierName',
            dataIndex: 'supplierName',
        },
        {
            title: 'Selling Price',
            key: 'sellPrice',
            dataIndex: 'sellPrice',
        },
        {
            title: 'Buying Price',
            key: 'netPrice',
            dataIndex: 'netPrice',
        },
        {
            title: 'Profit Margin',
            dataIndex: 'profit',
            key: 'profit',
            render: (text, record) => {
                const profit = record.sellPrice - record.netPrice;
                return profit ? profit.toFixed(2) : '0.00';
            },
        },
    ];

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const summaryRow = () => {
        const totalSellPrice = flattenedSales.reduce((sum, record) => sum + record.sellPrice, 0).toFixed(2);
        const totalNetPrice = flattenedSales.reduce((sum, record) => sum + record.netPrice, 0).toFixed(2);
        const totalProfit = flattenedSales.reduce((sum, record) => sum + (record.sellPrice - record.netPrice), 0).toFixed(2);

        return (
            <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={7} align="left">
                    <strong>Total</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                    <strong>{totalSellPrice}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                    <strong>{totalNetPrice}</strong>
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
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item>Sales</Breadcrumb.Item>
                    <Breadcrumb.Item>Report List</Breadcrumb.Item>
                </Breadcrumb>

                {/* TODO:::::::::::::::: Search functionality not ADDED */}
                <Form layout="inline" className='flex justify-start px-4 py-4 gap-2 md:pb-6'>
                    <Form.Item label="Date">
                        <RangePicker
                            style={{ width: 200 }}
                        // defaultValue={[dayjs('2024-01-01', dateFormat), dayjs('2025-01-01', dateFormat)]}
                        />
                    </Form.Item>
                    <Form.Item label="RV No.">
                        <Input
                            placeholder="Search by RV No."
                            style={{ color: 'black', width: 150 }} // Inline style for clarity
                        />
                    </Form.Item>
                    <Form.Item label="User">
                        <Select
                            defaultValue={"All"}
                            // onChange={setMode}
                            style={{ width: 100 }}
                        >
                            <Select.Option value="All">All</Select.Option>
                            <Select.Option value="Admin">Admin</Select.Option>
                            <Select.Option value="User">User</Select.Option>
                        </Select>
                    </Form.Item>
                    <Button type="primary" success color='secondary'>
                        Filter
                    </Button>
                </Form>

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
                        rowKey="_id"
                        pagination={{
                            pageSize: pageSize,
                            onChange: (page, size) => {
                                setCurrentPage(page);
                                setPageSize(size);
                            },
                        }}
                        scroll={{ x: 'max-content' }}
                        summary={summaryRow}
                    />
                </div>
            </Content>
        </>
    );
};

export default ReportList;

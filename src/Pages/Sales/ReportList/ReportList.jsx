
import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, DatePicker, Form, Input, Layout, Select, Table, Spin, theme, message } from 'antd';
import useSales from '../../../Hooks/useSales';
import useUsers from '../../../Hooks/useUsers';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import useAdmin from '../../../Hooks/useAdmin';
import useAuth from '../../../Hooks/useAuth';
import { BiRefresh } from 'react-icons/bi';
import useIsSuperAdmin from '../../../Hooks/useIsSuperAdmin';
import useClientArea from '../../../Hooks/useClientArea';
import useAllUsers from '../../../Hooks/useAllUsers';

const { Header, Content } = Layout;

const ReportList = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50000);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);
    const [userType, setUserType] = useState('All');
    const [officeType, setOfficeType] = useState('All');
    const [hasSearched, setHasSearched] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    // Build query params object
    const queryParams = {
        search: searchQuery,
        startDate: dateRange[0] ? dayjs(dateRange[0]).format('YYYY-MM-DD') : '',
        endDate: dateRange[1] ? dayjs(dateRange[1]).format('YYYY-MM-DD') : '',
        officeId: officeType !== 'All' ? officeType : '',
        sellBy: userType !== 'All' ? userType : '',
    };

    const { sales, pagination, refetch, isLoading } = useSales(page, limit, queryParams);
    const { clientArea } = useClientArea(1, 100);

    const [isAdmin] = useAdmin();
    const [isSuperAdmin] = useIsSuperAdmin();
    const auth = useAuth();

    const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });

    // Conditionally load users or allUsers based on super-admin status
    const { users, isLoading: isUsersLoading } = !isSuperAdmin ? useUsers() : { users: [], refetch: () => { }, isLoading: false };
    const { allUsers, isLoading: isAllUsersLoading } = isSuperAdmin ? useAllUsers() : { allUsers: [], isLoading: false };

    const handleTableChange = (pagination) => {
        setPage(pagination.current);
        setLimit(pagination.pageSize);
    };

    // const handleRefresh = () => {
    //     setDateRange([null, null]);
    //     setOfficeType('All');
    //     setUserType('All');
    //     setPage(1);
    //     refetch().then(() => message.success('Data refreshed successfully'));
    // };
    const handleRefresh = async () => {
        setHasSearched(true);   // 🔑 unlock data rendering
        setSearchLoading(true);
        setDateRange([null, null]);
        setOfficeType('All');
        setUserType('All');
        setPage(1);

        try {
            await refetch();
            message.success('Data loaded successfully');
        } finally {
            setSearchLoading(false); // ✅ stop spinner
        }
    };


    // Filter sales after fetching (dateRange / invoiceNo / userType / officeType)
    const [filteredSales, setFilteredSales] = useState([]);

    // Update the filter to remove invoice filtering (since API handles it):
    useEffect(() => {
        if (!hasSearched) {
            setFilteredSales([]);
            return;
        }

        let filtered = sales;

        if (dateRange[0] && dateRange[1]) {
            const startDate = dayjs(dateRange[0]);
            const endDate = dayjs(dateRange[1]);
            filtered = filtered.filter(record =>
                dayjs(record.date).isBetween(startDate, endDate, null, '[]')
            );
        }

        setFilteredSales(filtered);
    }, [sales, dateRange, hasSearched]);

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

    // Handle refreshing the data
    // const handleRefresh = () => {
    //     setLoading(true); // Show loading spinner while refreshing
    //     setDateRange([null, null]); // Clear the date range filter
    //     setInvoiceNo(''); // Clear the invoice/document filter
    //     setOfficeType('All'); // Reset office type filter
    //     setUserType('All'); // Reset user type filter

    //     // Refetch the sales data from the API or useSales hook
    //     refetch()
    //         .then(() => {
    //             setLoading(false); // Stop loading once data is fetched
    //             message.success('Data refreshed successfully');
    //         })
    //         .catch(error => {
    //             console.error("Error refreshing data: ", error);
    //             setLoading(false); // Stop loading even if there was an error
    //         });
    // };

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
            sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            // defaultSortOrder: 'descend', // Default sorting order
        },
        // {
        //     title: 'Passenger Name',
        //     dataIndex: 'mode',
        //     key: 'mode',
        //     align: 'center',
        // },
        {
            title: 'Invoice No.',
            dataIndex: 'rvNumber',
            key: 'rvNumber',
            align: 'center',
            sorter: (a, b) => a.rvNumber.localeCompare(b.rvNumber),
        },
        {
            title: 'Ticket No.',
            key: 'documentNumber',
            dataIndex: 'documentNumber',
            align: 'center',
            sorter: (a, b) => a.airlineCode.localeCompare(b.airlineCode),
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
            sorter: (a, b) => a.supplierName.localeCompare(b.supplierName),
        },
        {
            title: 'Selling Price',
            key: 'sellPrice',
            dataIndex: 'sellPrice',
            align: 'center',
            sorter: (a, b) => a.sellPrice - b.sellPrice,
        },
        {
            title: 'Buying Price',
            key: 'buyingPrice',
            dataIndex: 'buyingPrice',
            align: 'center',
            sorter: (a, b) => a.buyingPrice - b.buyingPrice,
        },
        {
            title: 'Profit Margin',
            dataIndex: 'profit',
            key: 'profit',
            align: 'center',
            sorter: (a, b) => (a.sellPrice - a.buyingPrice) - (b.sellPrice - b.buyingPrice),
            render: (text, record) => {
                const profit = record.sellPrice - record.buyingPrice;
                return profit ? profit.toFixed(2) : '0.00';
            },
        },
    ];

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();


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


    // const summaryRow = () => {
    //     const totalSellPrice = filteredSales.reduce((sum, record) => {
    //         const price = Number(record.sellPrice) || 0;
    //         return sum + price;
    //     }, 0).toFixed(2);

    //     const totalBuyingPrice = filteredSales.reduce((sum, record) => {
    //         const price = Number(record.buyingPrice) || 0;
    //         return sum + price;
    //     }, 0).toFixed(2);

    //     const totalProfit = filteredSales.reduce((sum, record) => {
    //         const sellPrice = Number(record.sellPrice) || 0;
    //         const buyingPrice = Number(record.buyingPrice) || 0;
    //         return sum + (sellPrice - buyingPrice);
    //     }, 0).toFixed(2);

    //     return (
    //         <Table.Summary fixed>
    //             <Table.Summary.Row style={{ backgroundColor: '#e0f7fa', fontWeight: 'bold' }}>
    //                 <Table.Summary.Cell index={0} colSpan={columns.length - 3} align="left">
    //                     <strong>Total</strong>
    //                 </Table.Summary.Cell>
    //                 <Table.Summary.Cell index={columns.length - 2} align="center">
    //                     <strong style={{ color: '#00838f' }}>{totalSellPrice}</strong>
    //                 </Table.Summary.Cell>
    //                 <Table.Summary.Cell index={columns.length - 1} align="center">
    //                     <strong style={{ color: '#00838f' }}>{totalBuyingPrice}</strong>
    //                 </Table.Summary.Cell>
    //                 <Table.Summary.Cell index={columns.length} align="center">
    //                     <strong style={{ color: '#00838f' }}>{totalProfit}</strong>
    //                 </Table.Summary.Cell>
    //             </Table.Summary.Row>
    //         </Table.Summary>
    //     );
    // };

    return (
        <>
            <Header
                className='flex justify-between items-center shadow-lg py-4 pl-4 pr-3 md:px-8'
                style={{ background: colorBgContainer }}
            >
                <div>
                    <h2 className='text-2xl md:text-4xl font-bold'>Report</h2>
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

                <Form layout="inline" className='flex flex-wrap justify-start px-4 py-4 gap-2 md:pb-6'>
                    <Form.Item label={<b>Date Range</b>}>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => {
                                setDateRange(dates);
                                setPage(1);
                            }}
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>

                    <Form.Item label={<b>Search</b>}>
                        <Input
                            placeholder="Invoice or Ticket No."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            allowClear
                            style={{ width: 200 }}
                        />
                    </Form.Item>

                    {isSuperAdmin && (
                        <Form.Item label={<b>Office</b>}>
                            <Select
                                value={officeType}
                                onChange={(value) => {
                                    setOfficeType(value);
                                    setPage(1);
                                }}
                                style={{ width: 180 }}
                            >
                                <Select.Option value="All">All Offices</Select.Option>
                                {clientArea && clientArea.map(client => (
                                    <Select.Option key={client.id} value={client.officeId}>
                                        {client.officeName}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}

                    {!isAdmin && !isSuperAdmin && (
                        <Form.Item label={<b>User</b>}>
                            <Select
                                value={auth.user?.displayName}
                                disabled
                                style={{ width: 180 }}
                            >
                                <Select.Option value={auth.user?.displayName}>
                                    {auth.user?.displayName}
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    )}

                    {isAdmin && !isSuperAdmin && (
                        <Form.Item label={<b>User</b>}>
                            <Select
                                value={userType}
                                onChange={(value) => {
                                    setUserType(value);
                                    setPage(1);
                                }}
                                style={{ width: 180 }}
                            >
                                <Select.Option value="All">All Users</Select.Option>
                                {users && users.map(user => (
                                    <Select.Option key={user.id} value={user.name}>
                                        {user.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}

                    {isSuperAdmin && (
                        <Form.Item label={<b>User</b>}>
                            <Select
                                value={userType}
                                onChange={(value) => {
                                    setUserType(value);
                                    setPage(1);
                                }}
                                style={{ width: 180 }}
                            >
                                <Select.Option value="All">All Users</Select.Option>
                                {allUsers && allUsers.map(user => (
                                    <Select.Option key={user.id} value={user.name}>
                                        {user.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}

                    <Button
                        type="default"
                        onClick={handleRefresh}
                    >
                        Reset
                    </Button>

                    <Button type="primary" onClick={handleRefresh} loading={searchLoading} icon={<BiRefresh size={18} />}>
                        Search
                    </Button>
                </Form>

                {hasSearched && (
                    <div className='w-full flex justify-center gap-6 pb-6'>
                        <div className='bg-green-700 p-4 rounded-lg flex-1 text-white'>
                            <div className='text-2xl font-bold'>Total Sales</div>
                            <div className='text-xl font-semibold'>{totalSellPrice}</div>
                        </div>
                        <div className='bg-blue-700 p-4 rounded-lg flex-1 text-white'>
                            <div className='text-2xl font-bold'>Total Buy</div>
                            <div className='text-xl font-semibold'>{totalBuyingPrice}</div>
                        </div>
                        <div className='bg-red-700 p-4 rounded-lg flex-1 text-white'>
                            <div className='text-2xl font-bold'>Total Profit</div>
                            <div className='text-xl font-semibold'>{totalProfit}</div>
                        </div>
                    </div>
                )}

                <div
                    style={{
                        minHeight: 360,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {!hasSearched ? (
                        <div className="text-center py-20 text-gray-500">
                            Please select filters and click <b>Search</b>
                        </div>
                    ) : (
                        <Table
                            bordered
                            size='small'
                            columns={columns}
                            dataSource={filteredSales}
                            rowKey={record => record.documentNumber}
                            loading={searchLoading}
                            pagination={{
                                current: page,
                                pageSize: limit,
                                total: pagination.total,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50', '100'],
                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                                onChange: (page, pageSize) => {
                                    setPage(page);
                                    setLimit(pageSize);
                                },
                            }}
                            onChange={handleTableChange}
                            // summary={summaryRow}
                            scroll={{ x: 'max-content' }}
                        />
                    )}
                </div>
            </Content>
        </>
    );
};

export default ReportList;

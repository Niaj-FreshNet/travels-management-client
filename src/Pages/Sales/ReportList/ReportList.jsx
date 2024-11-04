
import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, DatePicker, Form, Input, Layout, Select, Table, Spin, theme, message } from 'antd';
import useSales from '../../../Hooks/useSales';
import useUsers from '../../../Hooks/useUsers';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import { IoDocumentTextSharp } from 'react-icons/io5';
import useAdmin from '../../../Hooks/useAdmin';
import useAuth from '../../../Hooks/useAuth';
import { BiRefresh } from 'react-icons/bi';
import useIsSuperAdmin from '../../../Hooks/useIsSuperAdmin';
import useClientArea from '../../../Hooks/useClientArea';
import useAllUsers from '../../../Hooks/useAllUsers';

const { Header, Content } = Layout;

const ReportList = () => {
    const { sales, refetch, isLoading } = useSales();
    const { clientArea } = useClientArea();
    const [isAdmin] = useAdmin();
    const [isSuperAdmin] = useIsSuperAdmin();
    const auth = useAuth();
    const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
    const [flattenedSales, setFlattenedSales] = useState([]);
    const [loading, setLoading] = useState(false);

    const [dateRange, setDateRange] = useState([null, null]);
    const [invoiceNo, setInvoiceNo] = useState('');
    const [userType, setUserType] = useState('All');
    const [officeType, setOfficeType] = useState('All');
    const [filteredSales, setFilteredSales] = useState([]);

    // Conditionally load users or allUsers based on super-admin status
    const { users, isLoading: isUsersLoading } = !isSuperAdmin ? useUsers() : { users: [], refetch: () => { }, isLoading: false };
    const { allUsers, isLoading: isAllUsersLoading } = isSuperAdmin ? useAllUsers() : { allUsers: [], isLoading: false };

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
                isRefunded: sale.isRefunded,
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

        // Combined Invoice No. and Document Number Filtering
        if (invoiceNo) {
            filtered = filtered.filter(record =>
                (typeof record.rvNumber === 'string' && record.rvNumber.includes(invoiceNo)) ||
                (typeof record.documentNumber === 'string' && record.documentNumber.includes(invoiceNo))
            );
        }

        if (officeType !== 'All') {
            filtered = filtered.filter(record => record.officeId === officeType);
        }

        if (userType !== 'All') {
            filtered = filtered.filter(record => record.sellBy === userType);
        }

        setFilteredSales(filtered);
    };

    useEffect(() => {
        handleFilter();
    }, [dateRange, invoiceNo, officeType, userType, flattenedSales]);

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
    const handleRefresh = () => {
        setLoading(true); // Show loading spinner while refreshing
        setDateRange([null, null]); // Clear the date range filter
        setInvoiceNo(''); // Clear the invoice/document filter
        setOfficeType('All'); // Reset office type filter
        setUserType('All'); // Reset user type filter

        // Refetch the sales data from the API or useSales hook
        refetch()
            .then(() => {
                setLoading(false); // Stop loading once data is fetched
                message.success('Data refreshed successfully');
            })
            .catch(error => {
                console.error("Error refreshing data: ", error);
                setLoading(false); // Stop loading even if there was an error
            });
    };

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
                        // style={{ width: 220 }}
                        />
                    </Form.Item>
                    <Form.Item label={<b>Invoice No.</b>}>
                        <Input
                            placeholder="Search by RV No. or Document No."
                            value={invoiceNo}
                            onChange={(e) => setInvoiceNo(e.target.value)}
                            style={{ color: 'black', width: 250 }}
                        />
                    </Form.Item>

                    {isSuperAdmin && (
                        <Form.Item label={<b>ClientArea</b>}>
                            <Select
                                value={officeType}
                                onChange={(value) => setOfficeType(value)}
                                style={{ width: 180 }}
                            >
                                <Select.Option value="All">All</Select.Option>
                                {clientArea && clientArea.map(client => (
                                    <Select.Option key={client._id} value={client.officeId}>
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
                                onChange={(value) => setUserType(value)}
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
                                onChange={(value) => setUserType(value)}
                                style={{ width: 180 }}
                            >
                                <Select.Option value="All">All</Select.Option>
                                {users && users.map(user => (
                                    <Select.Option key={user._id} value={user.name}>
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
                                onChange={(value) => setUserType(value)}
                                style={{ width: 180 }}
                            >
                                <Select.Option value="All">All</Select.Option>
                                {allUsers && allUsers.map(user => (
                                    <Select.Option key={user._id} value={user.name}>
                                        {user.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                    <Button
                        type="default"
                        // onClick={handleReset}
                        style={{ marginLeft: '8px' }}
                    >
                        <a href="">Reset</a>
                    </Button>
                    <Button onClick={handleRefresh}>
                        <BiRefresh size={24} />
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
                        bordered
                        size='small'
                        columns={columns}
                        dataSource={filteredSales}
                        rowKey={record => record.documentNumber}
                        loading={loading || isLoading}
                        pagination={false}
                        summary={summaryRow}
                        scroll={{ x: 'max-content' }}
                    />
                </div>
            </Content>
        </>
    );
};

export default ReportList;

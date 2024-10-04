import React, { useEffect, useState } from 'react';
import { Breadcrumb, Layout, Table, theme } from 'antd';
import SearchVendor from './SearchVendor';
import useSales from '../../../Hooks/useSales';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import './styles.css'; // Make sure to import your CSS file
import MakePayment from './MakePayment';

const { Header, Content } = Layout;

const NewPayment = () => {
    const { sales, refetch, isLoading } = useSales();
    const axiosUser = useAxiosUser();

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
    const [searchResults, setSearchResults] = useState([]); // State to manage search results

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

    const columns = [
        {
            title: 'Serial',
            key: 'serial',
            render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
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
            title: 'Buying Price',
            key: 'netPrice',
            dataIndex: 'netPrice',
        },
    ];

    const calculateTotalSale = (data) => {
        return Array.isArray(data) ? data.reduce((total, record) => total + record.netPrice, 0) : 0;
    };

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const dataSource = searchResults.length > 0 ? searchResults : sales;
    const totalSale = calculateTotalSale(dataSource);

    return (
        <>
            <Header
                className='flex justify-between items-center shadow-lg py-4 pl-4 pr-3 md:px-8'
                style={{ background: colorBgContainer }}
            >
                <div>
                    <h2 className='text-2xl md:text-4xl font-bold'>Payment</h2>
                </div>
                <div className='mt-1'>
                    <SearchVendor refetch={refetch} onSearchResults={setSearchResults} />
                </div>
            </Header>
            <Content style={marginStyle}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item> </Breadcrumb.Item>
                    <Breadcrumb.Item>Airlines</Breadcrumb.Item>
                </Breadcrumb>
                <div
                    style={{
                        minHeight: 360,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Table
                        columns={columns}
                        dataSource={dataSource} // Display search results or default airlines
                        loading={isLoading}
                        rowKey={(record) => record._id}
                        pagination={false}
                        bordered
                        className='custom-table'
                        summary={() => (
                            <Table.Summary.Row>
                                <Table.Summary.Cell colSpan={3} className="text-right font-bold">
                                    Total Sale
                                </Table.Summary.Cell>
                                <Table.Summary.Cell className="font-bold">
                                    {totalSale.toFixed(0)}
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        )}
                    />
                    <div className="flex justify-evenly items-center px-4 py-2 bg-white shadow rounded-b-lg">
                        <div>
                            <p className="text-lg font-semibold">Total Due: {totalSale.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="flex justify-center items-center px-4 pt-2 pb-4 bg-white shadow rounded-b-lg">
                        <MakePayment totalDue={totalSale.toFixed(2)} refetch={refetch} />
                    </div>
                </div>
            </Content>
        </>
    );
};

export default NewPayment;

import React, { useEffect, useState } from 'react';
import { Breadcrumb, Layout, Spin, Table, theme } from 'antd';
import SearchVendor from './SearchVendor';
import useSales from '../../../Hooks/useSales';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import './styles.css'; // Make sure to import your CSS file
import MakePayment from './MakePayment';
import useSuppliers from '../../../Hooks/useSuppliers';
import { IoDocumentTextSharp } from 'react-icons/io5';

const { Header, Content } = Layout;

const NewPayment = () => {
    const { sales, refetch, isLoading, isError, error } = useSales();

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
    const [searchResults, setSearchResults] = useState([]); // State to manage search results
    const [dataSource, setDataSource] = useState([]);
    const [totalDue, setTotalDue] = useState(0); // State to manage total due
    const [selectedSupplierName, setSelectedSupplierName] = useState(''); // State for selected supplier name
    const [loading, setLoading] = useState(false);

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
            render: (_, __, index) => index + 1,
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
            title: 'Buying Price',
            key: 'buyingPrice',
            dataIndex: 'buyingPrice',
            align: 'center',
        },
        {
            title: 'Selling Price',
            key: 'sellPrice',
            dataIndex: 'sellPrice',
            align: 'center',
        },
    ];

    const calculateTotalSale = (data) => {
        if (!Array.isArray(data)) return 0; // Return 0 if data is not an array

        const total = data.reduce((total, record) => {
            const sellPrice = Number(record.sellPrice);
            return total + (isNaN(sellPrice) ? 0 : sellPrice); // Add 0 if sellPrice is NaN
        }, 0);

        return isNaN(total) ? 0 : total; // Return 0 if total is NaN
    };

    const calculateTotalBuy = (data) => {
        if (!Array.isArray(data)) return 0; // Return 0 if data is not an array

        const total = data.reduce((total, record) => {
            const buyingPrice = Number(record.buyingPrice);
            return total + (isNaN(buyingPrice) ? 0 : buyingPrice); // Add 0 if buyingPrice is NaN
        }, 0);

        return isNaN(total) ? 0 : total; // Return 0 if total is NaN
    };

    useEffect(() => {
        // Only show sales data if a search has been performed
        if (searchResults.length > 0) {
            setDataSource(searchResults);
        } else {
            setDataSource([]); // Clear the data source if no search has been performed
        }
    }, [searchResults]);

    // const dataSource = searchResults.length > 0 ? searchResults : sales || [];
    const totalSale = calculateTotalSale(dataSource);
    const totalBuy = calculateTotalBuy(dataSource);

    const handleTotalDue = (totalDue) => {
        setTotalDue(totalDue); // Update the total due state
    };
    // console.log(totalDue)

    const updatedTotalDue = (paidAmount) => {
        setTotalDue((prevTotalDue) => {
            const updatedTotalDue = prevTotalDue - paidAmount;
            // Log the updated total due value here
            console.log("Updated Total Due:", updatedTotalDue);
            return updatedTotalDue;
        });
    };

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
                    <h2 className='text-2xl md:text-4xl font-bold'>Payment</h2>
                </div>
                <div className='mt-1'>
                    <SearchVendor
                        refetch={refetch}
                        onSearchResults={setSearchResults}
                        onTotalDue={handleTotalDue}
                        onSupplierName={setSelectedSupplierName}
                    />
                </div>
            </Header>
            <Content style={marginStyle}>
                <Breadcrumb
                    style={{ margin: '16px 0' }}
                    items={[
                        {
                            title: 'Payment',
                        },
                        {
                            title: 'New Payment',
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
                        dataSource={dataSource} // Display search results
                        loading={isLoading}
                        rowKey={(record) => record._id}
                        pagination={false}
                        bordered
                        className='custom-table'
                        locale={{
                            emptyText: loading ? (
                                <div
                                    className="flex flex-col justify-center items-center"
                                    style={{ height: '100%', textAlign: 'center' }}
                                >
                                    <Spin size="large" />
                                    <p style={{ marginTop: '16px', fontSize: '18px', color: '#888' }}>
                                        Make a new payment here...
                                    </p>
                                </div>
                            ) : (
                                <div
                                    className="flex flex-col justify-center items-center my-10"
                                    style={{ height: '100%', textAlign: 'center' }}
                                >
                                    <IoDocumentTextSharp size={90} />
                                    <p style={{ fontSize: '18px', color: '#888' }}>
                                    Please search a vendor to show data...
                                    </p>
                                </div>
                            )
                        }}
                        summary={() => (
                            <Table.Summary.Row>
                                <Table.Summary.Cell colSpan={3} className="text-right font-bold">
                                    Total Sale
                                </Table.Summary.Cell>
                                <Table.Summary.Cell className="font-bold text-center">
                                    {totalBuy.toFixed(0)}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell className="font-bold text-center">
                                    {totalSale.toFixed(0)}
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        )}
                    />
                    <div className="flex justify-evenly items-center px-4 py-2 bg-white shadow rounded-b-lg">
                        <div>
                            <p className="text-lg font-semibold">Total Due: &nbsp;
                                {totalDue ? (
                                    <span className='font-bold'>{totalDue.toFixed(2)}</span>
                                ) : (
                                    <span className='font-bold'>---</span>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-center items-center px-4 pt-4 pb-8 bg-white shadow rounded-b-lg">
                        <MakePayment
                            refetch={refetch}
                            selectedSupplierName={selectedSupplierName}
                            totalDue={totalDue.toFixed(2)}
                            onPaymentSuccess={updatedTotalDue} // Pass the function to update totalDue
                        />
                    </div>
                </div>
            </Content>
        </>
    );
};

export default NewPayment;

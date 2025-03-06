import React, { useMemo } from "react";
import { Table, Typography, Divider, Form, Input } from "antd";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import useSales from "../../Hooks/useSales";

const { Title, Text } = Typography;

export const ComponentToPrint = React.forwardRef((props, ref) => {
    const { saleData } = props;
    const axiosSecure = useAxiosSecure();
    const { sales, refetch, isLoading, isError, error } = useSales();

    // Filter sales data to match the RV number from saleData prop
    const filteredSales = useMemo(() => {
        return sales.filter((sale) => sale.rvNumber === saleData.rvNumber);
    }, [sales, saleData.rvNumber]);

    // Calculate total sell price, buying price, and profit
    const totalSellPrice = useMemo(
        () => filteredSales.reduce((acc, sale) => acc + sale.sellPrice, 0),
        [filteredSales]
    );
    const totalBuyingPrice = useMemo(
        () => filteredSales.reduce((acc, sale) => acc + sale.buyingPrice, 0),
        [filteredSales]
    );
    const totalProfit = useMemo(
        () => filteredSales.reduce((acc, sale) => acc + (sale.sellPrice - sale.buyingPrice), 0),
        [filteredSales]
    );

    // Define columns for Ant Design Table
    const columns = [
        { title: 'Passenger Name', dataIndex: 'passengerName', key: 'passengerName', align: 'center' },
        { title: 'Sector', dataIndex: 'sector', key: 'sector', align: 'center' },
        { title: 'Airline Code', dataIndex: 'airlineCode', key: 'airlineCode', align: 'center' },
        { title: 'Document No.', dataIndex: 'documentNumber', key: 'documentNumber', align: 'center' },
        { title: 'Vendor Name', dataIndex: 'supplierName', key: 'supplierName', align: 'center' },
        { title: 'Selling Price', dataIndex: 'sellPrice', key: 'sellPrice', align: 'center', render: (text) => <Text strong>{text}</Text> },
        { title: 'Buying Price', dataIndex: 'buyingPrice', key: 'buyingPrice', align: 'center', render: (text) => <Text strong>{text}</Text> },
        {
            title: 'Profit',
            dataIndex: 'profit',
            key: 'profit',
            align: 'center',
            width: 110, // Increase the width to your preferred value
            render: (_, record) => <Text strong>{(record.sellPrice - record.buyingPrice).toFixed(2)}</Text>,
        },
        { title: 'Remarks', dataIndex: 'remarks', key: 'remarks', align: 'center' },
    ];
    
    const getFirstWord = (officeId) => {
        // Use a regular expression to match the first word before any symbol
        const match = officeId.match(/^[^-_.#]*/);
        return match ? match[0] : '';
    };

    return (
        <div ref={ref}>
            <div style={{ textAlign: 'center', marginBottom: '12px', marginTop: '8px' }}>
                <div className="text-4xl font-bold">{getFirstWord(saleData.officeId)}</div>
                <div className="text-xl">Travel & Tourism</div>
            </div>
            <Divider />
            <div className="flex justify-between mb-4 p-6">
                <div>
                    <Text strong>Office ID :</Text> <Text>{saleData.officeId}</Text><br />
                    <Text strong>Assigner Name :</Text> <Text>{saleData.sellBy}</Text><br />
                    <Text strong>Receipt No. :</Text> <Text>{saleData.rvNumber}</Text>
                </div>
                <div>
                    <Text strong>Date:</Text> <Text>{new Date(saleData.date).toLocaleDateString()}</Text><br />
                    <Text strong>Mode:</Text> <Text>{saleData.mode}</Text>
                </div>
            </div>
            <Divider />
            <Title level={3} style={{ textAlign: 'center' }}>Report</Title>
            <div className="px-4 py-2">
                <Table
                    dataSource={filteredSales}
                    columns={columns}
                    pagination={false}
                    bordered
                    rowKey="documentNumber"
                    style={{ marginBottom: '20px' }}
                />
            </div>
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
                <div className='flex justify-end mt-4 mb-8'>
                    <Form layout="inline" className='flex flex-col gap-1 md:gap-2 lg:gap-2'>
                        <Form.Item label={<span className="font-bold">Total Selling</span>}>
                            <Input
                                value={totalSellPrice}
                                readOnly
                                style={{ color: 'black', textAlign: 'right' }} // Inline style for clarity
                            />
                        </Form.Item>
                        <Form.Item label={<span className="font-bold">Total Buying</span>}>
                            <Input
                                value={totalBuyingPrice}
                                readOnly
                                style={{ color: 'black', textAlign: 'right' }} // Inline style for clarity
                            />
                        </Form.Item>
                        <Form.Item label={<span className="font-bold">Total Profit</span>}>
                            <Input
                                value={totalProfit.toFixed(2)}
                                readOnly
                                style={{ color: 'black', fontWeight: 'bold', textAlign: 'right' }} // Inline style for clarity
                            />
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
});

import React from "react";
import { Table, Typography, Divider, Space, Form, Input } from "antd";

// Destructure to get relevant properties
const { Title, Text } = Typography;

export const ComponentToPrint = React.forwardRef((props, ref) => {
    const { saleData } = props;


    const profit = saleData.sellPrice - saleData.buyingPrice;

    // Define columns for Ant Design Table
    const columns = [
        {
            title: 'Airline Code',
            dataIndex: 'airlineCode',
            key: 'airlineCode',
            align: 'center',
        },
        {
            title: 'Document No.',
            dataIndex: 'documentNumber',
            key: 'documentNumber',
            align: 'center',
        },
        {
            title: 'Vendor Name',
            dataIndex: 'supplierName',
            key: 'supplierName',
            align: 'center',
        },
        {
            title: 'Selling Price',
            dataIndex: 'sellPrice',
            key: 'sellPrice',
            align: 'center',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Buying Price',
            dataIndex: 'buyingPrice',
            key: 'buyingPrice',
            align: 'center',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Profit',
            dataIndex: 'profit',
            key: 'profit',
            align: 'center',
            render: (text) => <Text strong>{profit.toFixed(2)}</Text>,
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            align: 'center',
        },
    ];

    // Sample data for the items table
    const dataSource = [
        {
            key: '1',
            airlineCode: saleData.airlineCode,
            documentNumber: saleData.documentNumber,
            supplierName: saleData.supplierName,
            sellPrice: saleData.sellPrice,
            buyingPrice: saleData.buyingPrice,
            profit: saleData.profit,
            remarks: saleData.remarks,
        },
    ];

    return (
        <div className="" ref={ref}>
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <div className="text-4xl font-bold">FlyAid Travels</div>
                <div className="text-xl">Travel & Tourism</div>
            </div>
            <Divider />
            <div className="flex justify-between mb-4 py-4">
                <div>
                    <Text strong>Assigner Name :</Text> <Text>{saleData.sellBy}</Text>
                    <br />
                    <Text strong>Receipt No. :</Text> <Text>{saleData.rvNumber}</Text>
                </div>
                <div>
                    <Text strong>Date:</Text> <Text>{new Date(saleData.date).toLocaleDateString()}</Text>
                    <br />
                    <Text strong>Mode:</Text> <Text>{saleData.mode}</Text>
                </div>
            </div>
            <Divider />
            <Title level={3} style={{ textAlign: 'center' }}>Report</Title>
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                bordered
                style={{ marginBottom: '20px' }}
            />
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
                <div className='flex justify-end mt-4 mb-8'>
                    <Form layout="inline" className='flex flex-col gap-1 md:gap-2 lg:gap-2'>
                        <Form.Item label={<span className="font-bold">Total Selling</span>}>
                            <Input
                                value={saleData.sellPrice}
                                readOnly
                                style={{ color: 'black', textAlign: 'right' }} // Inline style for clarity
                            />
                        </Form.Item>
                        <Form.Item label={<span className="font-bold">Total Buying</span>}>
                            <Input
                                value={saleData.buyingPrice}
                                readOnly
                                style={{ color: 'black', textAlign: 'right' }} // Inline style for clarity
                            />
                        </Form.Item>
                        <Form.Item label={<span className="font-bold">Total Profit</span>}>
                            <Input
                                value={profit.toFixed(2)}
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

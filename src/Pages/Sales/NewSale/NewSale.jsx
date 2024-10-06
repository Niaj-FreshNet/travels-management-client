import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, ConfigProvider, DatePicker, Form, Input, Layout, message, Popconfirm, Select, Space, Table, theme } from 'antd';
import { QuestionCircleOutlined, SaveOutlined } from '@ant-design/icons';
import useAirlines from '../../../Hooks/useAirlines';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';

const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
      &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
        border-width: 0;
  
        > span {
          position: relative;
        }
  
        &::before {
          content: '';
          background: linear-gradient(135deg, #6253e1, #04befe);
          position: absolute;
          inset: 0;
          opacity: 1;
          transition: all 0.3s;
          border-radius: inherit;
        }
  
        &:hover::before {
          opacity: 0;
        }
      }
    `,
}));

const { Header, Content } = Layout;

const NewSale = () => {
    // const { airlines, refetch, isLoading, isError, error } = useAirlines();
    const axiosUser = useAxiosUser();
    const { styles } = useStyle();

    const [form] = Form.useForm(); // Use form instance
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
    const [airlineOptions, setAirlineOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [airlineIATA, setAirlineIATA] = useState({});
    const [dataSource, setDataSource] = useState([
        {
            key: '0',
            airlineCode: '',
            documentNumber: '',
            supplierName: '',
            sellPrice: '',
            netPrice: '',
            remarks: '',
        },
    ]);
    const [count, setCount] = useState(1);
    const [mode, setMode] = useState('');
    const [date, setDate] = useState(null);

    useEffect(() => {
        const fetchOptions = async () => {
            const airlinesData = await axiosUser.get('/airlines');
            console.log(airlinesData.data);
            setAirlineOptions(airlinesData.data.map(a => a.airlineCode));
            const suppliersData = await axiosUser.get('/suppliers');
            console.log(suppliersData.data);
            setVendorOptions(suppliersData.data.map(v => v.supplierName));
            setAirlineIATA(
                airlinesData.data.reduce((acc, a) => {
                    acc[a.airlineCode] = a.iataName;
                    return acc;
                }, {})
            );
        };
        fetchOptions();
    }, [axiosUser]);


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


    const deleteRow = (key) => {
        if (dataSource.length <= 1) {
            message.warning("You cannot delete this!");
            return;
        }
        const newData = dataSource.filter((item) => item.key !== key);
        setDataSource(newData);
    };


    const handleAdd = () => {
        const newData = {
            key: count.toString(),
            airlineCode: '',
            documentNumber: '',
            supplierName: '',
            sellPrice: '',
            netPrice: '',
            remarks: '',
        };
        setDataSource([...dataSource, newData]);
        setCount(count + 1);
    };

    const handleChange = (key, dataIndex, value) => {
        const newData = dataSource.map(item =>
            item.key === key ? { ...item, [dataIndex]: value } : item
        );
        setDataSource(newData);
        form.setFieldsValue({ dataSource: newData }); // Update form values
    };

    const generateRVNumber = () => {
        // Prefix with 'RV-' and use the current date and a random number for uniqueness
        const datePart = dayjs().format('YYYYMM'); // Format date as 'YYYYMM'
        const randomPart = Math.floor(1000 + Math.random() * 9000); // Generate random 4-digit number
        return `RV-${datePart}-${randomPart}`; // e.g., RV-20241003-1234
    };

    const handleSave = async () => {
        try {
            await form.validateFields(); // Validate all fields in the form

            // Create an array of data to send
            const salesData = dataSource.map(item => ({
                airlineCode: item.airlineCode,
                documentNumber: item.documentNumber,
                iataName: airlineIATA[item.airlineCode],
                supplierName: item.supplierName,
                sellPrice: Number(item.sellPrice),
                netPrice: Number(item.netPrice),
                remarks: item.remarks,
            }));
            const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
            const payload = {
                rvNumber: generateRVNumber(), // Generate RV No for each sale
                mode,
                date: formattedDate,
                sales: salesData,
                totalSellPrice,
                totalNetPrice,
                totalProfit,
                postStatus: 'Pending',
                paymentStatus: 'Due',
            };
            console.log(payload);
            const response = await axiosUser.post('/sale', payload);
            console.log(response);

            message.success('Data saved successfully!');
            handleCancel();
        } catch (error) {
            console.error('Failed to save data:', error);
            message.error('Failed to save sales report. Please try again.');
        }
    };



    const handleCancel = () => {
        form.resetFields();
        setDataSource([{ key: '0', airlineCode: '', documentNumber: '', supplierName: '', sellPrice: '', netPrice: '', remarks: '' }]);
        setDate(null);
    };

    const columns = [
        {
            title: 'Serial',
            key: 'serial',
            render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
        },
        {
            title: 'Airline Code',
            dataIndex: 'airlineCode',
            key: 'airlineCode',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'airlineCode']}
                    rules={[{ required: true, message: 'Airline Code is required' }]} // Validation rule
                    style={{ margin: 0 }} // Remove default margin
                >
                    <Select
                        value={text}
                        onChange={(value) => handleChange(record.key, 'airlineCode', value)}
                        style={{ width: '100%' }}
                        dropdownMatchSelectWidth={false}
                    >
                        {airlineOptions.map(option => (
                            <Select.Option
                                key={option}
                                value={option}
                                style={{ width: '100%' }}
                            >
                                {option}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            ),
        },
        {
            title: 'IATA Name',
            dataIndex: 'iataName',
            key: 'iataName',
            render: (text, record) => airlineIATA[record.airlineCode],
        },
        {
            title: 'Document No.',
            dataIndex: 'documentNumber',
            key: 'documentNumber',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'documentNumber']}
                    rules={[{ required: true, message: 'Document Number is required' }]} // Validation rule
                    style={{ margin: 0 }} // Remove default margin
                >
                    <Input
                        value={text}
                        onChange={(e) => handleChange(record.key, 'documentNumber', e.target.value)}
                    />
                </Form.Item>
            ),
        },
        {
            title: 'Vendor Name',
            dataIndex: 'supplierName',
            key: 'supplierName',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'supplierName']}
                    rules={[{ required: true, message: 'Vendor Name is required' }]} // Validation rule
                    style={{ margin: 0 }} // Remove default margin
                >
                    <Select
                        value={text}
                        onChange={(value) => handleChange(record.key, 'supplierName', value)}
                        style={{ width: '100%' }}
                        dropdownMatchSelectWidth={false}
                    >
                        {vendorOptions.map(option => (
                            <Select.Option key={option} value={option}>
                                {option}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            ),
        },
        {
            title: 'Sell Price',
            dataIndex: 'sellPrice',
            key: 'sellPrice',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'sellPrice']}
                    rules={[{ required: true, message: 'Sell Price is required' }]} // Validation rule
                    style={{ margin: 0 }} // Remove default margin
                >
                    <Input
                        type="number"
                        value={text}
                        onChange={(e) => handleChange(record.key, 'sellPrice', e.target.value)}
                    />
                </Form.Item>
            ),
        },
        {
            title: 'Net Price',
            dataIndex: 'netPrice',
            key: 'netPrice',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'netPrice']}
                    rules={[{ required: true, message: 'Net Price is required' }]} // Validation rule
                    style={{ margin: 0 }} // Remove default margin
                >
                    <Input
                        type="number"
                        value={text}
                        onChange={(e) => handleChange(record.key, 'netPrice', e.target.value)}
                    />
                </Form.Item>
            ),
        },
        {
            title: 'Profit',
            dataIndex: 'profit',
            key: 'profit',
            render: (text, record) => {
                const profit = record.sellPrice - record.netPrice;
                return profit ? profit.toFixed(2) : '0.00';
            },
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'remarks']}
                    style={{ margin: 0 }} // Remove default margin
                >
                    <Input
                        value={text}
                        onChange={(e) => handleChange(record.key, 'remarks', e.target.value)}
                    />
                </Form.Item>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Popconfirm
                        title="Delete this row?"
                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                        onConfirm={() => deleteRow(record.key)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const totalSellPrice = dataSource.reduce((acc, item) => acc + Number(item.sellPrice || 0), 0);
    const totalNetPrice = dataSource.reduce((acc, item) => acc + Number(item.netPrice || 0), 0);
    const totalProfit = totalSellPrice - totalNetPrice;

    return (
        <>
            <Header
                className='flex justify-between items-center shadow-lg py-4 pl-4 pr-3 md:px-8'
                style={{ background: colorBgContainer }}
            >
                <div>
                    <h2 className='text-2xl md:text-4xl font-bold'>Sales Report</h2>
                </div>
            </Header>

            <Content
                style={marginStyle}
            >
                <Breadcrumb
                    style={{ margin: '16px 0' }}
                >
                    <Breadcrumb.Item>Sales</Breadcrumb.Item>
                    <Breadcrumb.Item>New Sale</Breadcrumb.Item>
                </Breadcrumb>
                <Form layout="inline" className='flex justify-start px-4 py-4'>
                    <Form.Item label="Mode">
                        <Select
                            placeholder="Select Customer"
                            onChange={setMode}
                            style={{ width: 150 }}
                        >
                            <Select.Option value="Cash">Cash</Select.Option>
                            <Select.Option value="Credit">Credit</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Date">
                        <DatePicker
                            value={date}
                            onChange={setDate}
                            style={{ width: 200 }}
                        />
                    </Form.Item>
                </Form>


                <div
                    style={{
                        paddingBottom: 10,
                        minHeight: 360,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >

                    <Table
                        bordered
                        dataSource={dataSource}
                        columns={columns}
                        rowKey={(record) => record.key}
                        pagination={false}
                        scroll={{ x: true }}
                        style={{ whiteSpace: 'nowrap' }}
                    />

                    <div className='p-4'>
                        <div className=''>
                            <Button type="dashed" danger color='secondary' onClick={handleAdd}>
                                Add
                            </Button>
                        </div>

                        <div className='flex justify-center mt-8'>
                            <Form layout="inline" className='flex flex-col lg:flex-row gap-1 md:gap-2 lg:gap-2'>
                                <Form.Item label="Total Sell Price">
                                    <Input
                                        value={totalSellPrice.toFixed(2)}
                                        disabled
                                        style={{ color: 'black' }} // Inline style for clarity
                                    />
                                </Form.Item>
                                <Form.Item label="Total Net Price">
                                    <Input
                                        value={totalNetPrice.toFixed(2)}
                                        disabled
                                        style={{ color: 'black' }} // Inline style for clarity
                                    />
                                </Form.Item>
                                <Form.Item label={<span className="font-bold">Total Profit</span>}>
                                    <Input
                                        value={totalProfit.toFixed(2)}
                                        disabled
                                        style={{ color: 'black', fontWeight: 'bold' }} // Inline style for clarity
                                    />
                                </Form.Item>
                            </Form>
                        </div>

                        <div className='flex items-center justify-center gap-4 mt-4 md:mt-10'>
                            <Button type='primary' size='large' danger onClick={handleCancel}>Cancel</Button>
                            <ConfigProvider
                                button={{
                                    className: styles.linearGradientButton,
                                }}
                            >
                                <Button type="primary" size="large" icon={<SaveOutlined />}
                                    onClick={handleSave}>
                                    Save
                                </Button>
                            </ConfigProvider>
                        </div>
                    </div>
                </div>
            </Content>
        </>
    );
};

export default NewSale;

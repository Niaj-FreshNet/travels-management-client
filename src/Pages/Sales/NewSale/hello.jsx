import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, ConfigProvider, DatePicker, Form, Input, Layout, message, notification, Popconfirm, Select, Space, Table, theme } from 'antd';
import { QuestionCircleOutlined, SaveOutlined } from '@ant-design/icons';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import dayjs from 'dayjs';
import { createStyles } from 'antd-style';
import useSuppliers from '../../../Hooks/useSuppliers';

const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButtonBlue: css`
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
    linearGradientButtonGreen: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
      border-width: 0;
  
      > span {
        position: relative;
      }
  
      &::before {
        content: '';
        background: linear-gradient(135deg, #00b894, #00cec9); /* Gradient from green to teal */
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
    const axiosUser = useAxiosUser();
    const [form] = Form.useForm(); // Use form instance
    const { styles } = useStyle();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
    const [airlineOptions, setAirlineOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [airlineIATA, setAirlineIATA] = useState({});
    const [accountType, setAccountType] = useState({});
    const [totalDue, setTotalDue] = useState({});
    const [dataSource, setDataSource] = useState([
        {
            key: '0',
            airlineCode: '',
            documentNumber: '',
            supplierName: '',
            sellPrice: '',
            buyingPrice: '',
            remarks: '',
        },
    ]);
    const [count, setCount] = useState(1);
    const [mode, setMode] = useState('');
    const [date, setDate] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null); // Track selected supplier


    useEffect(() => {
        const fetchOptions = async () => {
            const airlinesData = await axiosUser.get('/airlines');
            setAirlineOptions(airlinesData.data.map(a => a.airlineCode));
            const suppliersData = await axiosUser.get('/suppliers');
            setVendorOptions(suppliersData.data.map(v => v.supplierName));
            const airlineIATA = airlinesData.data.reduce((acc, a) => {
                acc[a.airlineCode] = a.iataName;
                return acc;
            }, {});
            setAirlineIATA(airlineIATA);

            const accountType = suppliersData.data.reduce((vcc, v) => {
                vcc[v.accountType] = v.accountType;
                return vcc;
            }, {});
            setAccountType(accountType);

            const totalDue = suppliersData.data.reduce((vcc, v) => {
                vcc[v.totalDue] = v.totalDue;
                return vcc;
            }, {});
            setTotalDue(totalDue);

            // Log iataName and totalDue to console
            console.log('IATA Names:', airlineIATA);
            console.log('Account Type:', accountType);
            console.log('Total Due Amounts:', totalDue);
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
            buyingPrice: '',
            remarks: '',
        };
        setDataSource([...dataSource, newData]);
        setCount(count + 1);
    };

    const generateRVNumber = () => {
        const datePart = dayjs().format('YYYYMM');
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        return `RV-${datePart}-${randomPart}`;
    };

    const handleChange = (key, field, value) => {
        const newData = dataSource.map((item) => {
            if (item.key === key) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setDataSource(newData);
    };

    const handleSave = async () => {
        try {
            // Validate form fields
            await form.validateFields();

            // Prepare the sales data if validation passes
            const salesData = dataSource.map(item => ({
                airlineCode: item.airlineCode,
                documentNumber: item.documentNumber,
                iataName: airlineIATA[item.airlineCode],
                supplierName: item.supplierName,
                sellPrice: Number(item.sellPrice),
                buyingPrice: Number(item.buyingPrice),
                remarks: item.remarks,
            }));

            const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;

            const payload = {
                rvNumber: generateRVNumber(),
                mode,
                date: formattedDate,
                sales: salesData,
                totalSellPrice: dataSource.reduce((acc, item) => acc + Number(item.sellPrice || 0), 0),
                totalBuyingPrice: dataSource.reduce((acc, item) => acc + Number(item.buyingPrice || 0), 0),
                totalProfit: totalSellPrice - totalBuyingPrice,
                postStatus: 'Pending',
                paymentStatus: 'Due',
            };

            // Submit the sales data
            const response = await axiosUser.post('/sale', payload);

            // Show success notification
            notification.success({
                message: 'Success',
                description: 'Sale saved successfully!',
            });

            // Call handleCancel to close the modal or reset the form
            handleCancel();
        } catch (error) {
            if (error instanceof Error) {
                // Check if error is due to validation
                notification.error({
                    message: 'Validation Error',
                    description: 'Please fix the validation errors before submitting.',
                });
            } else {
                // For other errors, show a submission error notification
                console.error('Failed to save data:', error);
                notification.error({
                    message: 'Submission Failed',
                    description: 'Failed to save sales report. Please try again.',
                });
            }
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setDataSource([{ key: '0', airlineCode: '', documentNumber: '', supplierName: '', sellPrice: '', buyingPrice: '', remarks: '' }]);
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
                    rules={[{ required: true, message: 'Airline Code is required' }]}
                    style={{ margin: 0 }}
                >
                    <Select
                        value={text}
                        onChange={(value) => handleChange(record.key, 'airlineCode', value)}
                        style={{ width: '100%' }}
                        popupMatchSelectWidth={false}
                    >
                        {airlineOptions.map(option => (
                            <Select.Option key={option} value={option} style={{ width: '100%' }}>
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
            render: (text, record) => {
                const iataNameValue = airlineIATA[record.airlineCode];
                console.log('IATA Name:', iataNameValue); // Log IATA name
                return iataNameValue;
            },
        },
        {
            title: 'Document No.',
            dataIndex: 'documentNumber',
            key: 'documentNumber',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'documentNumber']}
                    rules={[{ required: true, message: 'Document Number is required' }]}
                    style={{ margin: 0 }}
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
                    rules={[{ required: true, message: 'Vendor Name is required' }]}
                    style={{ margin: 0 }}
                >
                    <Select
                        value={text}
                        onChange={(value) => handleChange(record.key, 'supplierName', value)}
                        style={{ width: '100%' }}
                        popupMatchSelectWidth={false}
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
            title: 'A/C',
            dataIndex: 'accountType',
            key: 'accountType',
            render: (text, record) => {
                const accountTypeValue = accountType[record.accountType];
                console.log('Account Type:', accountTypeValue); // Log account type
                return accountTypeValue;
            },
        },
        {
            title: 'Total Due',
            dataIndex: 'totalDue',
            key: 'totalDue',
            render: (text, record) => {
                const totalDueValue = totalDue[record.totalDue];
                console.log('Total Due:', totalDueValue); // Log total due
                return totalDueValue;
            },
        },        
        {
            title: 'Sell Price',
            dataIndex: 'sellPrice',
            key: 'sellPrice',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'sellPrice']}
                    rules={[{ required: true, message: 'Sell Price is required' }]}
                    style={{ margin: 0 }}
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
            dataIndex: 'buyingPrice',
            key: 'buyingPrice',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'buyingPrice']}
                    rules={[{ required: true, message: 'Net Price is required' }]}
                    style={{ margin: 0 }}
                >
                    <Input
                        type="number"
                        value={text}
                        onChange={(e) => {
                            const newBuyingPrice = Number(e.target.value);
                            handleChange(record.key, 'buyingPrice', newBuyingPrice);
                            console.log(newBuyingPrice)

                            // Validate against the selected supplier's total due
                            if (selectedSupplier && selectedSupplier.accountType === 'Debit') {
                                if (newBuyingPrice > selectedSupplier.totalDue) {
                                    console.log(totalBuyingPrice)
                                    notification.error({
                                        message: 'Validation Error',
                                        description: 'Buying price exceeds the total due amount. Please enter a value less than the total due.',
                                    });
                                }
                            }
                        }}
                    />
                </Form.Item>
            ),
        },
        {
            title: 'Profit',
            dataIndex: 'profit',
            key: 'profit',
            render: (text, record) => {
                const profit = record.sellPrice - record.buyingPrice;
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
                    rules={[{ required: true, message: 'Remarks is required' }]}
                    style={{ margin: 0 }}
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
    const totalBuyingPrice = dataSource.reduce((acc, item) => acc + Number(item.buyingPrice || 0), 0);
    const totalProfit = totalSellPrice - totalBuyingPrice;

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
                    items={[
                        {
                            title: 'Sales',
                        },
                        {
                            title: 'New Sale',
                        },
                    ]}
                />
                <Form form={form} layout="vertical">
                    <div className='flex flex-col gap-2'>
                        <div className='flex gap-4'>
                            <Form.Item
                                name="mode"
                                label="Mode"
                                rules={[{ required: true, message: 'Mode is required' }]}
                                style={{ width: '160px' }}
                            >
                                <Select value={mode} onChange={(value) => setMode(value)}>
                                    <Select.Option value="Cash">Cash</Select.Option>
                                    <Select.Option value="Credit">Credit</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="date"
                                label="Date"
                                rules={[{ required: true, message: 'Date is required' }]}
                                style={{ width: '160px' }}
                            >
                                <DatePicker value={date ? dayjs(date) : null} onChange={(date) => setDate(date)} style={{ width: '100%' }} />
                            </Form.Item>
                        </div>
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

                                footer={() => (
                                    <Button onClick={handleAdd} style={{ width: '100%' }}>
                                        Add more sales
                                    </Button>
                                )}
                            />

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
                                            value={totalBuyingPrice.toFixed(2)}
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

                            <div className='flex items-center justify-center gap-4 mt-6 mb-6'>
                                <Space style={{ justifyContent: 'center', width: '100%' }}>
                                    <Button type='primary' size='large' danger onClick={handleCancel}>Cancel</Button>
                                    <ConfigProvider
                                        button={{
                                            className: styles.linearGradientButtonBlue,
                                        }}
                                    >
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<SaveOutlined />}
                                            htmlType="submit"
                                            onClick={handleSave}
                                        >
                                            Save
                                        </Button>
                                    </ConfigProvider>
                                    <ConfigProvider
                                        button={{
                                            className: styles.linearGradientButtonGreen,
                                        }}
                                    >
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<SaveOutlined />}
                                            htmlType="submit"
                                        // onClick={handleSaveAndPost}
                                        >
                                            Save and Post
                                        </Button>
                                    </ConfigProvider>
                                </Space>
                            </div>
                        </div>
                    </div>
                </Form>
            </Content>
        </>
    );
};

export default NewSale;

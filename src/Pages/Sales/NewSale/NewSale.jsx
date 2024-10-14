import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, ConfigProvider, DatePicker, Form, Input, Layout, message, notification, Popconfirm, Select, Space, Table, theme } from 'antd';
import { QuestionCircleOutlined, SaveOutlined } from '@ant-design/icons';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import dayjs from 'dayjs';
import { createStyles } from 'antd-style';
import useSuppliers from '../../../Hooks/useSuppliers';
import useAirlines from '../../../Hooks/useAirlines';
import useSales from '../../../Hooks/useSales';
import { BiPlus } from 'react-icons/bi';
import useUsers from '../../../Hooks/useUsers';
import useAuth from '../../../Hooks/useAuth';
import { FaTrash } from 'react-icons/fa';

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

    // Use custom hooks to get airline and supplier data
    const { airlines } = useAirlines(); // Hook returns airlines data
    const { suppliers, refetch, isLoading, isError, error } = useSuppliers(); // Hook returns suppliers data
    const { sales } = useSales(); // Hook returns suppliers data
    const auth = useAuth();

    const [airlineOptions, setAirlineOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [airlineIATA, setAirlineIATA] = useState({});
    const [accountType, setAccountType] = useState({});
    const [totalDue, setTotalDue] = useState({});
    const [status, setStatus] = useState({});
    const [dataSource, setDataSource] = useState([
        {
            key: '0',
            airlineCode: '',
            documentNumber: '',
            supplierName: '',
            sellPrice: '',
            buyingPrice: '',
            remarks: '',
            passengerName: '',
            sector: ''
        },
    ]);
    const [count, setCount] = useState(1);
    const [mode, setMode] = useState('');
    const [date, setDate] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null); // Track selected supplier
    const [buyingPriceError, setBuyingPriceError] = useState(null);
    const [documentNumberError, setDocumentNumberError] = useState(null);


    useEffect(() => {
        if (airlines && suppliers) {
            // Setting airline options
            setAirlineOptions(airlines.map(a => a.airlineCode));

            // Setting vendor options
            setVendorOptions(suppliers.map(v => v.supplierName));

            // Create a mapping for airline IATA names

            const airlineIATA = airlines.reduce((acc, a) => {
                acc[a.airlineCode] = a.iataName;
                return acc;
            }, {});
            setAirlineIATA(airlineIATA);

            // Create account type mapping by supplier name
            const accountType = suppliers.reduce((acc, v) => {
                acc[v.supplierName] = v.accountType;
                return acc;
            }, {});
            setAccountType(accountType);

            // Create total due mapping by supplier name
            const totalDue = suppliers.reduce((acc, v) => {
                acc[v.supplierName] = v.totalDue;
                return acc;
            }, {});
            setTotalDue(totalDue);

            // Create status mapping by supplier name
            const status = suppliers.reduce((acc, v) => {
                acc[v.supplierName] = v.status;
                return acc;
            }, {});
            setStatus(status); // Assuming you have a `status` state to set
        }
    }, [airlines, suppliers]);



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
            key: count.toString(), // Unique key for the new row
            airlineCode: '',
            documentNumber: '',
            supplierName: '',
            sellPrice: '',
            buyingPrice: '',
            remarks: '',
            passengerName: '',
            sector: ''
        };
    
        // Correctly update the dataSource state
        setDataSource(prevDataSource => [...prevDataSource, newData]); 
        setCount(count + 1); // Increment the count
    };    

    const generateRVNumber = () => {
        const randomFourDigitNumber = Math.floor(1000 + Math.random() * 9000);
        return `RV-${randomFourDigitNumber}`;
    };

    const handleChange = (key, field, value) => {
        const newData = dataSource.map((item) => {
            if (item.key === key) {
                return { ...item, [field]: value };
            }
            return item;
        });

        // Validate document number
        if (field === 'documentNumber') {
            const existingDocument = sales.some(sale => sale.sales.some(item => item.documentNumber === value));
            if (existingDocument) {
                setDocumentNumberError('Document no. already exists.');
                notification.error({
                    message: 'Error',
                    description: 'You cannot issue a sale with an existing document no.',
                });
            } else {
                setDocumentNumberError(null);
            }
        }

        // Update selectedSupplier based on the supplier name
        if (field === 'supplierName') {
            const selected = vendorOptions.find(v => v === value);
            if (selected) {
                const supplierData = vendorOptions.find(v => v.supplierName === selected);
                setSelectedSupplier(supplierData); // Ensure supplierData contains accountType and totalDue
                console.log(supplierData)
            }
        }

        setDataSource(newData);
    };


    const handleSave = async () => {
        try {
            // Validate form fields
            await form.validateFields();

            // Check for document number errors before submitting
            if (documentNumberError) {
                notification.error({
                    message: 'Validation Error',
                    description: 'Please fix the document number error before submitting.',
                });
                return;
            }

            const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
            const displayName = auth.user ? auth.user.displayName : null;

            // Prepare the sales data if validation passes
            const salesData = dataSource.map(item => ({
                rvNumber: generateRVNumber(),
                airlineCode: item.airlineCode,
                documentNumber: item.documentNumber,
                iataName: airlineIATA[item.airlineCode],
                supplierName: item.supplierName,
                accountType: accountType[item.supplierName],
                sellPrice: Number(item.sellPrice),
                buyingPrice: Number(item.buyingPrice),
                mode,
                remarks: item.remarks,
                passengerName: item.passengerName,
                sector: item.sector,
                date: formattedDate,
                sellBy: displayName,
                postStatus: 'Pending',
                paymentStatus: 'Due',
            }));

            const totalSellPrice = dataSource.reduce((acc, item) => acc + Number(item.sellPrice || 0), 0);
            const totalBuyingPrice = dataSource.reduce((acc, item) => acc + Number(item.buyingPrice || 0), 0);
            const totalProfit = totalSellPrice - totalBuyingPrice;

            const payload = {
                date: formattedDate,
                sales: salesData,
                totalSellPrice,
                totalBuyingPrice,
                totalProfit,
            };

            // Calculate the new total due for each supplier
            const newTotalDue = {};
            salesData.forEach(sale => {
                const currentTotalDue = Number(totalDue[sale.supplierName]) || 0;

                if (!newTotalDue[sale.supplierName]) {
                    newTotalDue[sale.supplierName] = currentTotalDue;
                }
                const buyingPrice = Number(sale.buyingPrice) || 0;
                newTotalDue[sale.supplierName] += buyingPrice;
            });

            // Submit the sales data
            const response = await axiosUser.post('/sale', payload);

            // Update each supplier's total due in the supplier collection
            await Promise.all(
                Object.keys(newTotalDue).map(async supplierName => {
                    await axiosUser.patch(`/supplier/${supplierName}`, {
                        totalDue: newTotalDue[supplierName],
                    });
                })
            );

            // Update the local state to reflect the new total due
            setTotalDue(prevTotalDue => {
                const updatedTotalDue = { ...prevTotalDue };
                Object.keys(newTotalDue).forEach(supplierName => {
                    updatedTotalDue[supplierName] = newTotalDue[supplierName];
                });
                return updatedTotalDue;
            });

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


    const handleSaveAndPost = async () => {
        try {
            // Validate form fields
            await form.validateFields();

            // Check for document number errors before submitting
            if (documentNumberError) {
                notification.error({
                    message: 'Validation Error',
                    description: 'Please fix the document number error before submitting.',
                });
                return;
            }

            const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
            const displayName = auth.user ? auth.user.displayName : null;

            // Prepare the sales data if validation passes
            const salesData = dataSource.map(item => ({
                rvNumber: generateRVNumber(),
                airlineCode: item.airlineCode,
                documentNumber: item.documentNumber,
                iataName: airlineIATA[item.airlineCode],
                supplierName: item.supplierName,
                accountType: accountType[item.supplierName],
                sellPrice: Number(item.sellPrice),
                buyingPrice: Number(item.buyingPrice),
                mode,
                remarks: item.remarks,
                passengerName: item.passengerName,
                sector: item.sector,
                date: formattedDate,
                sellBy: displayName,
                postStatus: 'Posted',
                paymentStatus: 'Due',
                saveAndPost: 'Yes'
            }));

            const totalSellPrice = dataSource.reduce((acc, item) => acc + Number(item.sellPrice || 0), 0);
            const totalBuyingPrice = dataSource.reduce((acc, item) => acc + Number(item.buyingPrice || 0), 0);
            const totalProfit = totalSellPrice - totalBuyingPrice;

            const payload = {
                date: formattedDate,
                sales: salesData,
                totalSellPrice,
                totalBuyingPrice,
                totalProfit,
            };

            // Calculate the new total due for each supplier
            const newTotalDue = {};
            salesData.forEach(sale => {
                const currentTotalDue = Number(totalDue[sale.supplierName]) || 0;

                if (!newTotalDue[sale.supplierName]) {
                    newTotalDue[sale.supplierName] = currentTotalDue;
                }
                const buyingPrice = Number(sale.buyingPrice) || 0;
                newTotalDue[sale.supplierName] += buyingPrice;
            });

            // Submit the sales data
            const response = await axiosUser.post('/sale', payload);

            // Update each supplier's total due in the supplier collection
            await Promise.all(
                Object.keys(newTotalDue).map(async supplierName => {
                    await axiosUser.patch(`/supplier/${supplierName}`, {
                        totalDue: newTotalDue[supplierName],
                    });
                })
            );

            // Update the local state to reflect the new total due
            setTotalDue(prevTotalDue => {
                const updatedTotalDue = { ...prevTotalDue };
                Object.keys(newTotalDue).forEach(supplierName => {
                    updatedTotalDue[supplierName] = newTotalDue[supplierName];
                });
                return updatedTotalDue;
            });

            // Show success notification
            notification.success({
                message: 'Success',
                description: 'Sale saved and posted successfully!',
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
                console.error('Failed to save and post data:', error);
                notification.error({
                    message: 'Submission Failed',
                    description: 'Failed to save and post sales report. Please try again.',
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
            align: 'center',
            render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
        },
        {
            title: 'Passenger Name',
            dataIndex: 'passengerName',
            key: 'passengerName',
            align: 'center',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'passengerName']}
                    rules={[{ required: false, message: 'Passenger Name is required' }]}
                    style={{ margin: 0 }}
                >
                    <Input
                        value={text}
                        onChange={(e) => handleChange(record.key, 'passengerName', e.target.value)}
                    />
                </Form.Item>
            ),
        },
        {
            title: 'Sector',
            dataIndex: 'sector',
            key: 'sector',
            align: 'center',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'sector']}
                    rules={[{ required: false, message: 'Sector is required' }]}
                    style={{ margin: 0 }}
                >
                    <Input
                        value={text}
                        onChange={(e) => handleChange(record.key, 'sector', e.target.value)}
                        style={{ width: '80px' }}
                    />
                </Form.Item>
            ),
        },
        {
            title: 'Airline Code',
            dataIndex: 'airlineCode',
            key: 'airlineCode',
            align: 'center',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'airlineCode']}
                    rules={[{ required: true, message: 'Airline Code is required' }]}
                    style={{ margin: 0 }}
                >
                    <Select
                        showSearch
                        value={text}
                        onChange={(value) => handleChange(record.key, 'airlineCode', value)}
                        style={{ width: '100%' }}
                        popupMatchSelectWidth={false}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
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
            align: 'center',
            render: (text, record) => {
                const iataNameValue = airlineIATA[record.airlineCode];
                return iataNameValue;
            },
        },
        {
            title: 'Document No.',
            dataIndex: 'documentNumber',
            key: 'documentNumber',
            align: 'center',
            render: (_, record) => (
                <Form.Item
                    name={`documentNumber-${record.key}`}
                    validateStatus={documentNumberError ? 'error' : ''}
                    help={documentNumberError}
                    rules={[{ required: true, message: 'Document number is required' }]}
                    style={{ margin: 0 }}
                >
                    <Input
                        value={record.documentNumber}
                        onChange={(e) => handleChange(record.key, 'documentNumber', e.target.value)}
                    />
                </Form.Item>
            ),
        },
        {
            title: 'Vendor Name',
            dataIndex: 'supplierName',
            key: 'supplierName',
            align: 'center',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'supplierName']}
                    rules={[{ required: true, message: 'Vendor Name is required' }]}
                    style={{ margin: 0 }}
                >
                    <Select
                        showSearch
                        value={text}
                        onChange={(value) => handleChange(record.key, 'supplierName', value)}
                        style={{ width: '100%' }}
                        popupMatchSelectWidth={false}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
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
            title: 'Category',
            dataIndex: 'accountType',
            key: 'accountType',
            align: 'center',
            render: (text, record) => {
                const accountTypeValue = accountType[record.supplierName];
                return accountTypeValue;
            },
        },
        {
            title: 'Sell Price',
            dataIndex: 'sellPrice',
            key: 'sellPrice',
            align: 'center',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'sellPrice']}
                    rules={[{ required: true, message: 'Sell Price is required' }]}
                    style={{ margin: 0 }}
                >
                    <Input
                        type="number"
                        value={text}
                        style={{ width: '100px' }}
                        onChange={(e) => handleChange(record.key, 'sellPrice', e.target.value)}
                    />
                </Form.Item>
            ),
        },
        {
            title: 'Net Price',
            dataIndex: 'buyingPrice',
            key: 'buyingPrice',
            align: 'center',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'buyingPrice']}
                    rules={[{ required: true, message: 'Net Price is required' }]}
                    style={{ margin: 0 }}
                    help={buyingPriceError} // Show error message below the input
                    validateStatus={buyingPriceError ? 'error' : ''} // Change validation status
                >
                    <Input
                        type="number"
                        value={text}
                        style={{ width: '100px' }}
                        onChange={(e) => {
                            const newBuyingPrice = Number(e.target.value);
                            handleChange(record.key, 'buyingPrice', newBuyingPrice);
                            console.log(newBuyingPrice);

                            // Validate against the selected supplier's total due
                            const accountTypeValue = accountType[record.supplierName];
                            if (accountTypeValue === 'Debit') {
                                const totalDueValue = totalDue[record.supplierName];
                                const absolutedTotalDue = Math.abs(totalDueValue);

                                if (newBuyingPrice > absolutedTotalDue) {
                                    // Set error state if validation fails
                                    setBuyingPriceError('Net price cannot exceed the total due amount.');
                                    notification.error({
                                        message: 'Error',
                                        description: 'Net price cannot exceed the total due amount.',
                                    });
                                } else {
                                    // Clear error if validation passes
                                    setBuyingPriceError(null);
                                }
                            } else {
                                // Clear error if not a Debit account
                                setBuyingPriceError(null);
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
            align: 'center',
            render: (text, record) => {
                const profit = record.sellPrice - record.buyingPrice;
                return profit ? profit.toFixed(2) : '0.00';
            },
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            align: 'center',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'remarks']}
                    rules={[{ required: false, message: 'Remarks is required' }]}
                    style={{ margin: 0, width: '80px' }}
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
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Popconfirm
                        title="Delete this sale?"
                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                        onConfirm={() => deleteRow(record.key)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <a>
                            <FaTrash color='red' size={32} />
                        </a>
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
                                label={<b>Mode</b>}
                                rules={[{ required: true, message: 'Mode is required' }]}
                                style={{ width: '180px' }}
                            >
                                <Select value={mode} onChange={(value) => setMode(value)} placeholder="Select Mode">
                                    <Select.Option value="Cash">Cash</Select.Option>
                                    <Select.Option value="Credit">Credit</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="date"
                                label={<b>Date</b>}
                                rules={[{ required: true, message: 'Date is required' }]}
                                style={{ width: '180px' }}
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
                                        <BiPlus size={24} />
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
                                            onClick={handleSaveAndPost}
                                        >
                                            Save & Post
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

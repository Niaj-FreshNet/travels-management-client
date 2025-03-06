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
import useAxiosSecure from '../../../Hooks/useAxiosSecure';

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
    const axiosSecure = useAxiosSecure();
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
    const [buyingPriceErrors, setBuyingPriceErrors] = useState({});
    const [documentNumberErrors, setDocumentNumberErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingPost, setLoadingPost] = useState(false);


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

    const generateRVNumber = async () => {
        try {
            // Call the API to validate and get the last RV number
            const response = await axiosUser.get('/validate-existing-sales', {
                params: { documentNumber: 'dummy-document-number' } // Provide a dummy or default document number for validation
            });

            const { lastRVNumber } = response.data;

            // Return the next available RV number
            return lastRVNumber;
        } catch (error) {
            console.error('Error generating RV number:', error);
            throw new Error('Could not generate RV number');
        }
    };

    // Function to validate document number
    const validateDocumentNumber = async (documentNumber, key) => {
        try {
            const response = await axiosUser.get(`/validate-existing-sales`, {
                params: {
                    documentNumber: documentNumber
                }
            });

            // Check if the document number already exists
            if (response.data.exists) {
                // Set error for this specific row
                setDocumentNumberErrors(prevErrors => ({
                    ...prevErrors,
                    [key]: 'Document no. already exists.',
                }));
                notification.error({
                    message: 'Error',
                    description: 'You cannot issue a sale with an existing document no.',
                });
            } else {
                // Clear error for this specific row if no error
                setDocumentNumberErrors(prevErrors => ({
                    ...prevErrors,
                    [key]: null,
                }));
            }
        } catch (error) {
            console.error('Error validating document number:', error);
            notification.error({
                message: 'Error',
                description: 'Unable to validate the document number.',
            });
        }
    };

    const handleChange = (key, field, value) => {
        const newData = dataSource.map((item) => {
            if (item.key === key) {
                return { ...item, [field]: value };
            }
            return item;
        });

        // Validate document number
        // Call the validate function where necessary in your code
        if (field === 'documentNumber') {
            validateDocumentNumber(value, key);  // Pass the value and key of the row
        }

        if (field === 'buyingPrice') {
            const accountTypeValue = accountType[newData.find(item => item.key === key).supplierName];

            if (accountTypeValue === 'Debit') {
                const totalDueValue = totalDue[newData.find(item => item.key === key).supplierName];
                const absoluteTotalDue = Math.abs(totalDueValue);

                if (value > absoluteTotalDue) {
                    // Set error for the specific row
                    setBuyingPriceErrors(prevErrors => ({
                        ...prevErrors,
                        [key]: 'Net price cannot exceed the total due amount.',
                    }));
                    notification.error({
                        message: 'Error',
                        description: 'Net price cannot exceed the total due amount.',
                    });
                } else {
                    // Clear error for the specific row
                    setBuyingPriceErrors(prevErrors => ({
                        ...prevErrors,
                        [key]: null,
                    }));
                }
            } else {
                // Clear error if not a Debit account
                setBuyingPriceErrors(prevErrors => ({
                    ...prevErrors,
                    [key]: null,
                }));
            }
        }

        // Update selectedSupplier based on the supplier name
        if (field === 'supplierName') {
            const selectedSupplierData = vendorOptions.find(v => v.supplierName === value);
            if (selectedSupplierData) {
                setSelectedSupplier(selectedSupplierData); // Ensure supplierData contains accountType and totalDue
                console.log(selectedSupplierData);
            } else {
                setSelectedSupplier(null); // Clear selected supplier if not found
            }
        }

        setDataSource(newData);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Validate form fields
            await form.validateFields();

            // Check for document number errors before submitting
            // if (documentNumberErrors) {
            //     notification.error({
            //         message: 'Validation Error',
            //         description: 'Please fix the document number error before submitting.',
            //     });
            //     return;
            // }

            const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
            const displayName = auth.user ? auth.user.displayName : null;
            const email = auth.user ? auth.user?.email : null;

            // Get the current date and time for createdAt
            const createdAt = new Date().toISOString();

            // Prepare sales data if validation passes
            const salesData = await Promise.all(dataSource.map(async item => ({
                rvNumber: await generateRVNumber(), // Await the generation of the RV number
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
                createdAt,
                createdBy: email, /* i've added this email from server-side */
            })));

            // const totalSellPrice = salesData.reduce((acc, item) => acc + item.sellPrice, 0);
            // const totalBuyingPrice = salesData.reduce((acc, item) => acc + item.buyingPrice, 0);
            // const totalProfit = totalSellPrice - totalBuyingPrice;

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

            // Submit each sale individually
            await Promise.all(
                salesData.map(async (sale) => {
                    await axiosSecure.post('/sale', {
                        date: formattedDate,
                        ...sale, // Spread individual sale properties
                    });
                })
            );

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
                description: 'Sales saved successfully!',
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
        } finally {
            setLoading(false);
        }
    };


    const handleSaveAndPost = async () => {
        setLoadingPost(true);

        try {
            // Validate form fields
            await form.validateFields();

            // Check for document number errors before submitting
            // if (documentNumberErrors) {
            //     notification.error({
            //         message: 'Validation Error',
            //         description: 'Please fix the document number error before submitting.',
            //     });
            //     return;
            // }

            const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
            const displayName = auth.user ? auth.user.displayName : null;
            const email = auth.user ? auth.user?.email : null;

            // Get the current date and time for createdAt
            const createdAt = new Date().toISOString();

            // Prepare the sales data if validation passes
            const salesData = await Promise.all(dataSource.map(async item => ({
                rvNumber: await generateRVNumber(), // Await the generation of the RV number
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
                saveAndPost: 'Yes',
                createdAt,
                createdBy: email,
            })));

            // const totalSellPrice = salesData.reduce((acc, item) => acc + item.sellPrice, 0);
            // const totalBuyingPrice = salesData.reduce((acc, item) => acc + item.buyingPrice, 0);
            // const totalProfit = totalSellPrice - totalBuyingPrice;

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

            // Submit each sale individually
            await Promise.all(
                salesData.map(async (sale) => {
                    await axiosSecure.post('/sale', {
                        date: formattedDate,
                        ...sale, // Spread individual sale properties
                    });
                })
            );

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
                description: 'Sales saved successfully!',
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
        } finally {
            setLoadingPost(false);
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
        // {
        //     title: 'Passenger Name',
        //     dataIndex: 'passengerName',
        //     key: 'passengerName',
        //     align: 'center',
        //     render: (text, record) => (
        //         <Form.Item
        //             name={['dataSource', record.key, 'passengerName']}
        //             rules={[{ required: false, message: 'Passenger Name is required' }]}
        //             style={{ margin: 0, padding: 4,  }}
        //             className='bg-slate-300 rounded-lg'
        //         >
        //             <Input
        //                 value={text}
        //                 onChange={(e) => handleChange(record.key, 'passengerName', e.target.value)}
        //                 style={{ width: '80px' }}
        //             />
        //         </Form.Item>
        //     ),
        // },
        // {
        //     title: 'Sector',
        //     dataIndex: 'sector',
        //     key: 'sector',
        //     align: 'center',
        //     render: (text, record) => (
        //         <Form.Item
        //             name={['dataSource', record.key, 'sector']}
        //             rules={[{ required: false, message: 'Sector is required' }]}
        //             style={{ margin: 0, padding: 4,  }}
        //             className='bg-slate-300 rounded-lg'
        //         >
        //             <Input
        //                 value={text}
        //                 onChange={(e) => handleChange(record.key, 'sector', e.target.value)}
        //                 style={{ width: '50px' }}
        //             />
        //         </Form.Item>
        //     ),
        // },
        {
            title: 'Airline Code',
            dataIndex: 'airlineCode',
            key: 'airlineCode',
            align: 'center',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'airlineCode']}
                    rules={[{ required: true, message: 'Airline Code is required' }]}
                    style={{ margin: 0, padding: 4,  }}
                    className='bg-slate-300 rounded-lg'
                >
                    <Select
                        showSearch
                        value={text}
                        onChange={(value) => handleChange(record.key, 'airlineCode', value)}
                        style={{ width: '70%' }}
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
                    validateStatus={documentNumberErrors[record.key] ? 'error' : ''}
                    help={documentNumberErrors[record.key]} // Show the specific error for this row
                    rules={[{ required: true, message: 'Document number is required' }]}
                    style={{ margin: 0, padding: 4,  }}
                    className='bg-slate-300 rounded-lg'
                >
                    <Input
                        value={record.documentNumber}
                        onChange={(e) => handleChange(record.key, 'documentNumber', e.target.value)}

                        style={{ width: '130px' }}
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
                    style={{ margin: 0, padding: 4,  }}
                    className='bg-slate-300 rounded-lg'
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
        // {
        //     title: 'Category',
        //     dataIndex: 'accountType',
        //     key: 'accountType',
        //     align: 'center',
        //     render: (text, record) => {
        //         const accountTypeValue = accountType[record.supplierName];
        //         return accountTypeValue;
        //     },
        // },
        {
            title: 'Sell Price',
            dataIndex: 'sellPrice',
            key: 'sellPrice',
            align: 'center',
            render: (text, record) => (
                <Form.Item
                    name={['dataSource', record.key, 'sellPrice']}
                    rules={[{ required: true, message: 'Sell Price is required' }]}
                    style={{ margin: 0, padding: 4,  }}
                    className='bg-slate-300 rounded-lg'
                >
                    <Input
                        type="number"
                        value={text}
                        style={{ width: '80px' }}
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
                    style={{ margin: 0, padding: 4,  }}
                    help={buyingPriceErrors[record.key]} // Show error message below the input
                    validateStatus={buyingPriceErrors[record.key] ? 'error' : ''} // Change validation status for specific row
                    className='bg-slate-300 rounded-lg'
                >
                    <Input
                        type="number"
                        value={text}
                        style={{ width: '80px' }}
                        onChange={(e) => {
                            const newBuyingPrice = Number(e.target.value);
                            handleChange(record.key, 'buyingPrice', newBuyingPrice);
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
                    style={{ margin: 0, padding: 4, width: '50px' }}
                    className='bg-slate-300 rounded-lg'
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
                                style={{ width: '180px', padding: 4 }}
                    className='bg-slate-300 rounded-lg'
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
                                style={{ width: '180px', padding: 4 }}
                    className='bg-slate-300 rounded-lg'
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
                                scroll={{ x: 'min-content' }}
                                style={{}}

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
                                            loading={loading}
                                            disabled={loading || loadingPost}
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
                                            loading={loadingPost}
                                            disabled={loading || loadingPost}
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

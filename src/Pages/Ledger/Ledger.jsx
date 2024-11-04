import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, DatePicker, Form, Layout, message, Select, Spin, Table, theme } from 'antd';
import useSales from '../../Hooks/useSales';
import useAxiosUser from '../../Hooks/useAxiosUser';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import useSuppliers from '../../Hooks/useSuppliers';
import usePayment from '../../Hooks/usePayment';
import { IoDocumentTextSharp } from 'react-icons/io5';
import useAxiosSecure from '../../Hooks/useAxiosSecure';

const { Header, Content } = Layout;
const { RangePicker } = DatePicker;

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

const Ledger = () => {
  const axiosUser = useAxiosUser();
  const axiosSecure = useAxiosSecure();
  const { suppliers } = useSuppliers();
  const { sales } = useSales();
  const { payment } = usePayment();
  const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
  const [searchResults, setSearchResults] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [suppliersInfo, setSuppliersInfo] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const suppliersData = await axiosSecure.get('/suppliers');
        const suppliersInfo = suppliersData.data;
        setSuppliersInfo(suppliersInfo);
        setVendorOptions(['All', ...suppliersData.data.map(v => v.supplierName)]);
      } catch (error) {
        console.error('Failed to fetch options:', error);
        message.error('Failed to fetch vendor options');
      }
    };
    fetchOptions();
  }, [axiosUser]);

  const handleSearch = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      let filteredSales = sales;

      // Filter by supplier name if not "All"
      if (values.supplierName !== 'All') {
        filteredSales = filteredSales.filter(sale => sale.supplierName === values.supplierName);
      }

      // Filter by date range if selected
      if (values.dateRange) {
        const [startDate, endDate] = values.dateRange;
        filteredSales = filteredSales.filter(sale =>
          dayjs(sale.date).isBetween(dayjs(startDate), dayjs(endDate), null, '[]')
        );
      }

      // Log the selected supplier's Name to debug
      console.log('Filtered Sales:', filteredSales);

      if (filteredSales.length > 0) {
        // Fetch payments and filter by selected supplier name
        const paymentsResponse = await axiosSecure.get('/payment');
        let filteredPayments = paymentsResponse.data;

        if (values.supplierName !== 'All') {
          filteredPayments = filteredPayments.filter(payment => payment.supplierName === values.supplierName);
        }

        // Process data to add creditAmount and debitAmount based on accountType
        const processedData = filteredSales.map(sale => {
          const selectedSupplier = suppliersInfo.find(supplier => supplier.supplierName === sale.supplierName);
          const creditAmount = selectedSupplier?.accountType === 'Credit' ? sale.buyingPrice : 0;
          const debitAmount = selectedSupplier?.accountType === 'Debit' ? sale.buyingPrice : 0;
          return {
            ...sale,
            creditAmount,
            debitAmount,
          };
        });

        // Add the opening balance to the processed data
        suppliersInfo.forEach(supplier => {
          if (values.supplierName === 'All' || supplier.supplierName === values.supplierName) {
            const openingBalanceEntry = {
              date: supplier.date,
              supplierName: supplier.supplierName,
              airlineCode: '',
              documentNumber: '',
              remarks: 'Opening Balance',
              creditAmount: supplier.accountType === 'Credit' ? supplier.openingBalance : 0,
              debitAmount: supplier.accountType === 'Debit' ? supplier.openingBalance : 0,
            };
            processedData.unshift(openingBalanceEntry);
          }
        });

        // Process and add the filtered payments to the processed data
        filteredPayments.forEach(payment => {
          processedData.push({
            date: payment.paymentDate,
            supplierName: payment.supplierName,
            airlineCode: '',
            documentNumber: '',
            remarks: 'Payment',
            creditAmount: 0,
            debitAmount: payment.paidAmount,
          });
        });

        message.success(`Found ${filteredSales.length} sales records for vendor ${values.supplierName}.`);
        setSearchResults(processedData); // Update search results state with processed data
      } else {
        message.warning(`No sales records found for vendor ${values.supplierName}.`);
        setSearchResults([]); // No results found
      }
    } catch (error) {
      console.error('Failed to submit the form:', error);
      message.error('Failed to search vendor');
    } finally {
      setLoading(false);
    }
  };

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

  const dataSource = Array.isArray(searchResults) && searchResults.length > 0 ? searchResults : [];

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
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplierName',
      align: 'center',
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
      title: 'Remarks',
      key: 'remarks',
      dataIndex: 'remarks',
      align: 'center',
    },
    {
      title: 'Credit Amount',
      key: 'creditAmount',
      dataIndex: 'creditAmount',
      align: 'center',
      render: (text) => text === 0 ? '-' : text,
    },
    {
      title: 'Debit Amount',
      key: 'debitAmount',
      dataIndex: 'debitAmount',
      align: 'center',
      render: (text) => text === 0 ? '-' : text,
    },
  ];

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
          <h2 className='text-2xl md:text-4xl font-bold'>Supplier Ledger</h2>
        </div>
      </Header>
      <Content style={marginStyle}>
        <Breadcrumb
          style={{ margin: '16px 0' }}
          items={[
            {
              title: 'Home',
            },
            {
              title: 'Ledger',
            },
          ]}
        />

        <Spin spinning={loading}>
          <Form
            layout="inline"
            className='flex justify-start gap-2 px-4 py-4 md:pb-6'
            form={form}
            initialValues={{ layout: 'vertical' }}
            onFinish={handleSearch}
          >
            <Form.Item
              label={<b>Supplier Name</b>}
              name="supplierName"
              rules={[{ required: true, message: 'Please input the vendor name!' }]}
            >
              <Select
                showSearch
                placeholder="Select a vendor"
                style={{ width: 180 }}
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
            <Form.Item label={<b>Date</b>} name="dateRange">
              <RangePicker style={{ width: 230 }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                Search
              </Button>
            </Form.Item>
          </Form>
        </Spin>

        <div
          style={{
            minHeight: 360,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            rowKey={record => `${record.supplierName}-${record.documentNumber}`}
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
                        Please search another vendor to show data...
                        </p>
                    </div>
                )
            }}
          />
        </div>
      </Content>
    </>
  );
};

export default Ledger;
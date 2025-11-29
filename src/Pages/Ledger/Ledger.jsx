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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const { sales, pagination, refetch, isLoading, isError, error } = useSales(currentPage, pageSize, searchQuery);
  const axiosUser = useAxiosUser();
  const axiosSecure = useAxiosSecure();
  const { suppliers } = useSuppliers();
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
        const suppliersInfo = suppliersData?.data?.data?.data;
        setSuppliersInfo(suppliersInfo);
        setVendorOptions(['All', ...suppliersInfo.map(v => v.supplierName)]);
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
      setSearchResults([]);

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

      if (filteredSales.length > 0) {
        // Fetch payments and filter by selected supplier name
        const paymentsResponse = await axiosSecure.get('/payment');
        let filteredPayments = paymentsResponse?.data?.data?.data;

        if (values.supplierName !== 'All') {
          filteredPayments = filteredPayments.filter(payment => payment.supplierName === values.supplierName);
        }

        // Calculate total credit and debit amounts
        const processedData = [];
        let totalCreditAmount = 0;
        let totalDebitAmount = 0;

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
            processedData.push(openingBalanceEntry);
            totalCreditAmount += openingBalanceEntry.creditAmount;
            totalDebitAmount += openingBalanceEntry.debitAmount;
          }
        });

        filteredSales.forEach(sale => {
          const creditAmount = sale.buyingPrice || 0;
          processedData.push({
            ...sale,
            creditAmount,
            debitAmount: 0,
          });
          totalCreditAmount += creditAmount;
        });

        filteredPayments.forEach(payment => {
          const debitAmount = payment.paidAmount || 0;
          processedData.push({
            date: payment.paymentDate,
            supplierName: payment.supplierName,
            airlineCode: '',
            documentNumber: '',
            remarks: 'Payment',
            creditAmount: 0,
            debitAmount,
          });
          totalDebitAmount += debitAmount;
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
    {
      title: 'Remarks',
      key: 'remarks',
      dataIndex: 'remarks',
      align: 'center',
    },
  ];

  const summaryRow = (dataSource2) => {
    // Ensure dataSource2 is defined and is an array
    const totalCredit = (dataSource2 || [])
      .reduce((sum, record) => sum + Number(record.creditAmount || 0), 0)
      .toFixed(2);

    const totalDebit = (dataSource2 || [])
      .reduce((sum, record) => sum + Number(record.debitAmount || 0), 0)
      .toFixed(2);

    return (
      <Table.Summary.Row>
        <Table.Summary.Cell colSpan={5} align="center">
          <b>Total</b>
        </Table.Summary.Cell>
        <Table.Summary.Cell align="center">
          <b>{totalCredit}</b>
        </Table.Summary.Cell>
        <Table.Summary.Cell align="center">
          <b>{totalDebit}</b>
        </Table.Summary.Cell>
        <Table.Summary.Cell />
      </Table.Summary.Row>
    );
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

        <div className='w-full flex justify-start gap-2  px-4 md:pb-2 items-center'>
          <Spin spinning={loading}>
            <Form
              layout="inline"
              className='flex flex-grow justify-start gap-2 px-4 py-4 md:pb-6'
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

          <Button className='px-4 py-2 md:pb-2 bg-red-600 font-semibold' type="primary" htmlType="submit" style={{ width: '10%' }}>
            Print
          </Button>
        </div>

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
            loading={isLoading || loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            bordered
            rowKey={record => `${record.supplierName}-${record.documentNumber}`}
            summary={() => summaryRow(dataSource)}
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
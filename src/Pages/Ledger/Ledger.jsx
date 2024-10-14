import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, DatePicker, Form, Layout, message, Select, Spin, Table, theme } from 'antd';
import useSales from '../../Hooks/useSales';
import useAxiosUser from '../../Hooks/useAxiosUser';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';

const { Header, Content } = Layout;

const Ledger = () => {
  const axiosUser = useAxiosUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
  const [searchResults, setSearchResults] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [suppliersInfo, setSuppliersInfo] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const suppliersData = await axiosUser.get('/suppliers');
        const suppliersInfo = suppliersData.data;
        setSuppliersInfo(suppliersInfo);
        setVendorOptions(suppliersData.data.map(v => v.supplierName));
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
      const selectedSupplier = suppliersInfo.find(supplier => supplier.supplierName === values.supplierName);
      if (!selectedSupplier) {
        message.error('Supplier not found');
        setLoading(false);
        return;
      }

      // Log the selected supplier's Name to debug
      // console.log('Selected Supplier Name:', selectedSupplier.supplierName);

      // Call the API with supplierName as a query parameter
      const response = await axiosUser.get(`/sale?supplierName=${selectedSupplier.supplierName}`);
      const vendorData = response.data;

      // console.log('Vendor data:', vendorData);
      // console.log('date:', suppliersInfo)


      if (Array.isArray(vendorData) && vendorData.length > 0) {
        // Process data to add creditAmount and debitAmount based on accountType
        const processedData = vendorData.map(sale => {
          const creditAmount = selectedSupplier.accountType === 'Credit' ? sale.buyingPrice : 0;
          const debitAmount = selectedSupplier.accountType === 'Debit' ? sale.buyingPrice : 0;
          return {
            ...sale,
            creditAmount,
            debitAmount,
          };
        });

        // Add the opening balance to the processed data
        const openingBalanceEntry = {
          date: selectedSupplier.date,
          supplierName: selectedSupplier.supplierName,
          airlineCode: '',
          documentNumber: '',
          remarks: 'Opening Balance',
          creditAmount: selectedSupplier.accountType === 'Credit' ? selectedSupplier.openingBalance : 0,
          debitAmount: selectedSupplier.accountType === 'Debit' ? selectedSupplier.openingBalance : 0,
        };

        processedData.unshift(openingBalanceEntry);

        // Fetch payments and filter by selected supplier name
        const paymentsResponse = await axiosUser.get(`/payment?supplierName=${selectedSupplier.supplierName}`);
        const paymentsData = paymentsResponse.data.filter(payment => payment.supplierName === selectedSupplier.supplierName);

        // Process and add the filtered payments to the processed data
        paymentsData.forEach(payment => {
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

        message.success(`Found ${vendorData.length} sales records for vendor ${values.supplierName}.`);
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

  dayjs.extend(customParseFormat);
  dayjs.extend(isBetween);

  const { RangePicker } = DatePicker;

  const columns = [
    {
      title: 'Serial',
      key: 'serial',
      align: 'center',
      render: (_, __, index) => (currentPage - 1) * 25 + index + 1,
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
                placeholder="Select Supplier"
                style={{ width: 180 }}
              >
                {vendorOptions.map(option => (
                  <Select.Option key={option} value={option}>
                    {option}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={<b>Date</b>} >
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
            bordered
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            rowKey="_id"
            pagination={{
              current: currentPage,
              defaultPageSize: 25,
              showSizeChanger: true,
              pageSizeOptions: ['25', '50', '100'],
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </Content>
    </>
  );
};

export default Ledger;

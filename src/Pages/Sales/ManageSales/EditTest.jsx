import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, ConfigProvider, DatePicker, Form, Input, Layout, message, Modal, notification, Select, Space, Spin, Table, theme } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import useAirlines from '../../../Hooks/useAirlines';
import useSuppliers from '../../../Hooks/useSuppliers';
import useSales from '../../../Hooks/useSales';
import useAuth from '../../../Hooks/useAuth';
import './EditSale.css';
import './ModalStyles.css';

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

const EditSale = ({ visible, onClose, saleData, refetch, loading, setLoading }) => {
  const axiosUser = useAxiosUser();
  const [form] = Form.useForm(); // Use form instance
  const { styles } = useStyle();

  const { airlines } = useAirlines();
  const { suppliers } = useSuppliers();
  const { sales } = useSales();
  const auth = useAuth();

  const [airlineOptions, setAirlineOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [airlineIATA, setAirlineIATA] = useState({});
  const [accountType, setAccountType] = useState({});
  const [totalDue, setTotalDue] = useState({});
  const [supplierName, setSupplierName] = useState({});
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

  const [mode, setMode] = useState('');
  const [date, setDate] = useState(null);
  const [rvNumber, setRvNumber] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [buyingPriceError, setBuyingPriceError] = useState(null);
  const [documentNumberError, setDocumentNumberError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [closing, setClosing] = useState(false);


  useEffect(() => {
    if (saleData) {
      // Set form fields with saleData
      form.setFieldsValue({
        mode: saleData.mode,
        date: dayjs(saleData.date),
        dataSource: [{
          key: saleData._id,
          rvNumber: saleData.rvNumber,
          airlineCode: saleData.airlineCode || '',
          iataName: saleData.iataName || '',
          documentNumber: saleData.documentNumber || '',
          supplierName: saleData.supplierName || '',
          accountType: saleData.accountType || '',
          sellPrice: saleData.sellPrice || '',
          buyingPrice: saleData.buyingPrice || '',
          remarks: saleData.remarks || '',
          passengerName: saleData.passengerName || '',
          sector: saleData.sector || '',
        }],
      });

      // Set additional states if needed
      setMode(saleData.mode);
      setDate(dayjs(saleData.date));
      setRvNumber(saleData.rvNumber);
    }
    setLoading(false);

  }, [saleData, form, setLoading]);

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

      const supplierName = suppliers.reduce((acc, v) => {
        acc[v.supplierName] = v.supplierName;
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

  const handleChange = (key, field, value) => {
    const newData = dataSource.map((item) => {
      if (item.key === key) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setDataSource(newData);

    // Update the form field value
    form.setFieldsValue({
      dataSource: newData,
    });

    if (field === 'supplierName') {
      const selected = suppliers.find(v => v.supplierName === value);
      if (selected) {
        setSelectedSupplier(selected);
      }
    }
  };

  const handleUpdate = async (id, documentNumber) => {
    console.log(id, documentNumber)
    try {
      // Validate form fields
      const values = await form.validateFields();
      console.log(values)

    // Ensure dataSource is an object
    if (typeof values.dataSource !== 'object') {
      throw new Error('dataSource should be an object');
    }
      const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
      // const displayName = auth.user ? auth.user.displayName : null;

    // Convert dataSource object to an array for mapping
    const dataSourceArray = Object.keys(values.dataSource).map(key => values.dataSource[key]);

    // Prepare the sales data if validation passes
    const newSaleData = dataSourceArray.map(item => ({
        // rvNumber: generateRVNumber(),
        airlineCode: item.airlineCode,
        // documentNumber: item.documentNumber,
        // iataName: airlineIATA[item.airlineCode],
        supplierName: item.supplierName,
        // accountType: accountType[item.supplierName],
        sellPrice: Number(item.sellPrice),
        buyingPrice: Number(item.buyingPrice),
        mode: values.mode,
        remarks: item.remarks,
        passengerName: item.passengerName,
        sector: item.sector,
        date: formattedDate,
        // sellBy: displayName,
      }));
      console.log(newSaleData)

      const totalSellPrice = dataSource.reduce((acc, item) => acc + Number(item.sellPrice || 0), 0);
      const totalBuyingPrice = dataSource.reduce((acc, item) => acc + Number(item.buyingPrice || 0), 0);
      const totalProfit = totalSellPrice - totalBuyingPrice;

      // Calculate the new total due for each supplier
      const newTotalDue = {};
      newSaleData.forEach(sale => {
        const currentTotalDue = Number(totalDue[sale.supplierName]) || 0;

        if (!newTotalDue[sale.supplierName]) {
          newTotalDue[sale.supplierName] = currentTotalDue;
        }
        const buyingPrice = Number(sale.buyingPrice) || 0;
        newTotalDue[sale.supplierName] += buyingPrice;
      });

      // Submit the sales data
      const response = await axiosUser.patch(`/sale/${id}`, newSaleData);

      // Update each supplier's total due in the supplier collection
      // await Promise.all(
      //   Object.keys(newTotalDue).map(async supplierName => {
      //     await axiosUser.patch(`/supplier/${supplierName}`, {
      //       totalDue: newTotalDue[supplierName],
      //     });
      //   })
      // );

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
      handleClose();
    } catch (error) {
      /* if (error instanceof Error) {
         // Check if error is due to validation
         notification.error({
           message: 'Validation Error',
           description: 'Please fix the validation errors before submitting.',
         });
       } else { */
      // For other errors, show a submission error notification
      console.error('Failed to save data:', error);
      notification.error({
        message: 'Submission Failed',
        description: 'Failed to save sales report. Please try again.',
      });
      // }
    }
  };

  const handleClose = () => {
    setClosing(true); // Start the closing animation
    setTimeout(() => {
      setClosing(false);
      onClose(); // Close the modal after the animation duration
    }, 300); // Match the duration to your CSS transition duration
  };

  const columns = [
    {
      title: 'Passenger Name',
      dataIndex: 'passengerName',
      key: 'passengerName',
      align: 'center',
      render: (text, record) => (
        <Form.Item
          name={['dataSource', record.key, 'passengerName']}
          initialValue={record.passengerName}
          rules={[{ required: false, message: 'Passenger Name is required' }]}
          style={{ margin: 0 }}
        >
          <Input
            value={record.passengerName}
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
          initialValue={record.sector}
          rules={[{ required: false, message: 'Sector is required' }]}
          style={{ margin: 0 }}
        >
          <Input
            value={record.sector}
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
          initialValue={record.airlineCode}
          rules={[{ required: false, message: 'Airline Code is required' }]}
          style={{ margin: 0 }}
        >
          <Select
            showSearch
            value={record.airlineCode}
            style={{ width: '100%' }}
            popupMatchSelectWidth={false}
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
    // {
    //   title: 'IATA Name',
    //   dataIndex: 'iataName',
    //   key: 'iataName',
    //   align: 'center',
    //   render: (_, record) => (
    //     <Form.Item
    //       name={['dataSource', record.key, 'iataName']}
    //       initialValue={record.iataName}
    //       rules={[{ required: false, message: 'IATA Name is required' }]}
    //       style={{ margin: 0 }}
    //     >
    //       <Input
    //         disabled
    //         value={record.accountType}
    //       />
    //     </Form.Item>
    //   ),
    // },
    {
      title: 'Document No.',
      dataIndex: 'documentNumber',
      key: 'documentNumber',
      align: 'center',
      render: (_, record) => (
        <Form.Item
          name={['dataSource', record.key, 'documentNumber']}
          initialValue={record.documentNumber}
          rules={[{ required: false, message: 'Document number is required' }]}
          style={{ margin: 0 }}
        >
          <Input
            readOnly
            value={record.documentNumber}
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
          rules={[{ required: false, message: 'Vendor Name is required' }]}
          style={{ margin: 0 }}
        >
          <Select
            showSearch
            value={text}
            onChange={(value) => handleChange(record.key, 'supplierName', value)}
            style={{ width: '100%' }}
            popupMatchSelectWidth={false}
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
    //   title: 'Category',
    //   dataIndex: 'accountType',
    //   key: 'accountType',
    //   align: 'center',
    //   render: (_, record) => (
    //     <Form.Item
    //       name={['dataSource', record.key, 'accountType']}
    //       initialValue={record.accountType}
    //       rules={[{ required: false, message: 'Category is required' }]}
    //       style={{ margin: 0 }}
    //     >
    //       <Input
    //         disabled
    //         value={record.accountType}
    //       />
    //     </Form.Item>
    //   ),
    // },
    {
      title: 'Selling Price',
      dataIndex: 'sellPrice',
      key: 'sellPrice',
      align: 'center',
      render: (_, record) => (
        <Form.Item
          name={['dataSource', record.key, 'sellPrice']}
          initialValue={record.sellPrice}
          rules={[{ required: false, message: 'Sell Price is required' }]}
          style={{ margin: 0 }}
        >
          <Input
            value={record.sellPrice}
            type="number"
          />
        </Form.Item>
      ),
    },
    {
      title: 'Buying Price',
      dataIndex: 'buyingPrice',
      key: 'buyingPrice',
      align: 'center',
      render: (text, record) => (
        <Form.Item
          name={['dataSource', record.key, 'buyingPrice']}
          rules={[{ required: false, message: 'Net Price is required' }]}
          style={{ margin: 0 }}
          help={buyingPriceError} // Show error message below the input
          validateStatus={buyingPriceError ? 'error' : ''} // Change validation status
        >
          <Input
            type="number"
            value={text}
            style={{ width: '100px' }}
          // onChange={(e) => {
          //   const newBuyingPrice = Number(e.target.value);
          //   handleChange(record.key, 'buyingPrice', newBuyingPrice);

          //   // Validate against the selected supplier's total due
          //   const accountTypeValue = accountType[selectedSupplier.supplierName];
          //   // console.log(accountTypeValue)
          //   if (accountTypeValue === 'Debit') {
          //     const totalDueValue = totalDue[selectedSupplier.supplierName];
          //     const absolutedTotalDue = Math.abs(totalDueValue);

          //     if (newBuyingPrice > absolutedTotalDue) {
          //       // handleClose();
          //       // Set error state if validation fails
          //       setBuyingPriceError('Net price cannot exceed the total due amount.');
          //       notification.error({
          //         message: 'Error',
          //         description: 'Net price cannot exceed the total due amount.',
          //       });
          //     } else {
          //       // Clear error if validation passes
          //       setBuyingPriceError(null);
          //     }
          //   } else {
          //     // Clear error if not a Debit account
          //     setBuyingPriceError(null);
          //   }
          // }}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      align: 'center',
      render: (text, record) => (
        <Form.Item
          name={['dataSource', record.key, 'remarks']}
          initialValue={record.remarks}
          rules={[{ required: false, message: 'Remarks is required' }]}
          style={{ margin: 0 }}
        >
          <Input
            value={record.remarks}
          />
        </Form.Item>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: { colorPrimary: '#00b96b' },
      }}
    >
      {loading ? (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Light background
          zIndex: 9999, // High z-index to overlay on other elements
        }}>
          <div className="loader"></div>
        </div>
      ) : (
        <Modal
          open={visible}
          onCancel={handleClose}
          footer={null}
          width={1200}
          centered
          className={closing ? 'modal-closing' : 'modal-opening'}
        >
          <Content style={{ padding: '12px 12px 12px 12px', marginBottom: '-12px' }}>
            <div className='-mt-2'>
              <h2 className='text-xl'>Edit Sale</h2>
            </div>
            <div className='divider mt-2 mb-2'></div>
            <Form
              form={form}
              layout="vertical"
              onFinish={() => handleUpdate(saleData._id, saleData.documentNumber)}
              className='flex flex-col'
            >
              <div className='flex justify-between gap-4'>
                <div className='flex justify-start gap-6'>
                  <Form.Item
                    name="mode"
                    label={<b>Mode</b>}
                    initialValue={mode}
                    rules={[{ required: false, message: 'Mode is required' }]}
                    style={{ width: '180px' }}
                  >
                    <Select value={saleData.mode} onChange={(value) => setMode(value)} placeholder="Select Mode">
                      <Select.Option value="Cash">Cash</Select.Option>
                      <Select.Option value="Credit">Credit</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="date"
                    label={<b>Date</b>}
                    initialValue={date}
                    rules={[{ required: false, message: 'Date is required' }]}
                    style={{ width: '180px' }}
                  >
                    <DatePicker value={date ? dayjs(date) : null} onChange={(value) => setDate(value)} style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <Form.Item
                  label={<b>RV Number</b>}
                  style={{ width: '220px' }}
                  initialValue={rvNumber}>
                  <Input value={rvNumber} readOnly />
                </Form.Item>
              </div>
              <Form.Item>
                <Table
                  dataSource={dataSource}
                  columns={columns}
                  rowKey="key"
                  pagination={false}
                  bordered
                  style={{ whiteSpace: 'nowrap', marginBottom: '12px' }}
                  scroll={{ x: '280px' }} // Enable horizontal scroll if needed
                />
              </Form.Item>
              <div className='flex justify-start gap-4'>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className={styles.linearGradientButton}
                    icon={<SaveOutlined />}
                    style={{ height: '40px' }}
                  >
                    Save Changes
                  </Button>
                </Form.Item>
                <Form.Item>
                  <Button
                    onClick={handleClose}
                    className='btn btn-sm btn-error text-white'
                    style={{ height: '40px' }}
                  >
                    Cancel
                  </Button>
                </Form.Item></div>
            </Form>
          </Content>
        </Modal>
      )}
    </ConfigProvider>
  );
};

export default EditSale;

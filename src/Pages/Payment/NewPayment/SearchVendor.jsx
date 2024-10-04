import React, { useState, useEffect } from 'react';
import { Button, ConfigProvider, Form, Select, message, Modal, Spin } from 'antd';
import { createStyles } from 'antd-style';
import { IoMdAddCircleOutline } from 'react-icons/io';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import { SearchOutlined } from '@ant-design/icons';

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

const SearchVendor = ({ refetch, onSearchResults }) => {
    const axiosUser = useAxiosUser();
    const { styles } = useStyle();
    const [modal2Open, setModal2Open] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [suppliersInfo, setSuppliersInfo] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const suppliersData = await axiosUser.get('/suppliers');
                const suppliersInfo = suppliersData.data;
                console.log('Supplier Info', suppliersInfo);
                setSuppliersInfo(suppliersInfo); // Set suppliersInfo in state
                setVendorOptions(suppliersData.data.map(v => v.supplierName));
            } catch (error) {
                console.error('Failed to fetch options:', error);
                message.error('Failed to fetch vendor options');
            }
        };
        fetchOptions();
    }, [axiosUser]);

    const handleSubmit = async () => {
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
            console.log('Selected Supplier Name:', selectedSupplier.supplierName);

            // Call the API with supplierName as a query parameter
            const response = await axiosUser.get(`/sale?supplierName=${selectedSupplier.supplierName}`);
            const vendorData = response.data;

            console.log('Vendor data:', vendorData);

            if (vendorData && vendorData.length > 0) {
                message.success(`Found ${vendorData.length} sales records for vendor ${values.supplierName}.`);
                onSearchResults(vendorData); // Pass the sales array to the parent component
            } else {
                message.warning(`No sales records found for vendor ${values.supplierName}.`);
                onSearchResults([]); // No results found
            }

            setModal2Open(false);
        } catch (error) {
            console.error('Failed to submit the form:', error);
            message.error('Failed to search vendor');
        } finally {
            setLoading(false);
        }
    };
    
    // const handleSubmit = async () => {
    //     try {
    //         const values = await form.validateFields();
    //         setLoading(true);
    //         const selectedSupplier = suppliersInfo.find(supplier => supplier.supplierName === values.supplierName);
    //         if (!selectedSupplier) {
    //             message.error('Supplier not found');
    //             setLoading(false);
    //             return;
    //         }
    
    //         // Log the selected supplier's Name to debug
    //         console.log('Selected Supplier Name:', selectedSupplier.supplierName);
    
    //         // Call the API with supplierName as a query parameter
    //         const response = await axiosUser.get(`/sale?supplierName=${selectedSupplier.supplierName}`);
    //         const vendorData = response.data;
    
    //         console.log('Vendor data', vendorData);
    
    //         // Assuming paymentStatus is returned directly in the response
    //         if (vendorData.paymentStatus === 'Paid' || vendorData.paymentStatus === 'Due') {
    //             message.success(`Vendor ${values.supplierName} has ${vendorData.paymentStatus} payments.`);
    //             onSearchResults(vendorData.sales); // Pass the sales array to the parent component
    //         } else {
    //             message.warning(`Vendor ${values.supplierName} has ${vendorData.paymentStatus} payments.`);
    //             onSearchResults([]); // No results found
    //         }
    
    //         setModal2Open(false);
    //     } catch (error) {
    //         console.error('Failed to submit the form:', error);
    //         message.error('Failed to search vendor');
    //     } finally {
    //         setLoading(false);
    //     }
    // };   
    

    return (
        <>
            <ConfigProvider
                button={{
                    className: styles.linearGradientButton,
                }}
            >
                <Button
                    type="primary"
                    size="large"
                    icon={<SearchOutlined />}
                    onClick={() => setModal2Open(true)}
                >
                    Search Vendor
                </Button>
            </ConfigProvider>
            <Modal
                title="Search Airline"
                centered
                open={modal2Open}
                footer={null}
                onCancel={() => setModal2Open(false)}
            >
                <div className="divider mt-0"></div>
                <Spin spinning={loading}>
                    <Form
                        layout="vertical"
                        form={form}
                        initialValues={{
                            layout: 'vertical',
                        }}
                        style={{
                            maxWidth: 600,
                        }}
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            label="Vendor Name"
                            name="supplierName"
                            rules={[{ required: true, message: 'Please input the vendor name!' }]}
                        >
                            <Select placeholder="Select a vendor" style={{ width: '100%' }}>
                                {vendorOptions.map(option => (
                                    <Select.Option key={option} value={option}>
                                        {option}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item className="mt-6 mb-1">
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                Search
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </>
    );
};

export default SearchVendor;

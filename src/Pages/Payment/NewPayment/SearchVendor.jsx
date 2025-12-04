import React, { useState, useEffect } from 'react';
import { Button, ConfigProvider, Form, Select, message, Modal, Spin } from 'antd';
import { createStyles } from 'antd-style';
import { SearchOutlined } from '@ant-design/icons';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';

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

const SearchVendor = ({ refetch, onSearchResults, onTotalDue, onSupplierName }) => { // Add onTotalDue prop
    const axiosSecure = useAxiosSecure();
    const { styles } = useStyle();
    const [modal2Open, setModal2Open] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [suppliersInfo, setSuppliersInfo] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const suppliersData = await axiosSecure.get('/suppliers');
                const suppliersInfo = suppliersData.data?.data?.data;
                setSuppliersInfo(suppliersInfo); // Set suppliersInfo in state
                setVendorOptions(suppliersData.data?.data?.data.map(v => v.supplierName));
            } catch (error) {
                console.error('Failed to fetch options:', error);
                message.error('Failed to fetch vendor options');
            }
        };
        fetchOptions();
    }, [axiosSecure]);

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
            
            try {
                // Call the API with supplierName as a query parameter
                const response = await axiosSecure.get(`/sales?supplierName=${selectedSupplier.supplierName}`);
                const vendorData = response.data?.data?.data;
                // console.log(vendorData);

                if (vendorData && vendorData.length > 0) {
                    const totalDue = selectedSupplier.totalDue; // Assuming totalDue is a property in suppliersInfo
                    message.success(`Total due for vendor ${values.supplierName} is ${totalDue.toFixed(2)}.`);
                    onSearchResults(vendorData); // Pass the sales array and totalDue to the parent component
                    onTotalDue(totalDue); // Pass the sales array and totalDue to the parent component
                    // console.log(totalDue);
                    onSupplierName(selectedSupplier.supplierName); // Pass the supplier name to parent
                }
            } catch (apiError) {
                if (apiError.response && apiError.response.status === 404) {
                    // Handle 404 error specifically
                    const totalDue = selectedSupplier.totalDue;
                    message.success(`Total due for vendor ${values.supplierName} is ${totalDue.toFixed(2)}.`);
                    onSearchResults([]); // Pass the sales array and totalDue to the parent component
                    onTotalDue(totalDue);
                    // console.log(totalDue);
                    onSupplierName(selectedSupplier.supplierName);
                } else {
                    throw apiError;
                }
            }
            setModal2Open(false);
        } catch (error) {
            console.error('Failed to submit the form:', error);
            message.error('Failed to search vendor');
        } finally {
            setLoading(false);
        }
    };


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
                            <Select
                                showSearch
                                placeholder="Select a vendor"
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

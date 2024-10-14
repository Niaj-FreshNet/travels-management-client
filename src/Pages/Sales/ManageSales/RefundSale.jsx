import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Modal, Spin } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import useSuppliers from '../../../Hooks/useSuppliers';

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

const RefundSale = ({ refetch, visible, onClose, selectedSale }) => {
    const axiosUser = useAxiosUser();
    const { suppliers, isLoading } = useSuppliers();
    const { styles } = useStyle();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [accountType, setAccountType] = useState({});
    const [totalDue, setTotalDue] = useState({});

    useEffect(() => {
        if (selectedSale) {
            form.setFieldsValue({
                buyingPrice: selectedSale.buyingPrice,
            });
        }
    }, [selectedSale, form]);

    useEffect(() => {
        if (suppliers) {
            // Create account type and total due mapping by supplier name
            const accountTypeMapping = {};
            const totalDueMapping = {};

            suppliers.forEach((supplier) => {
                accountTypeMapping[supplier.supplierName] = supplier.accountType;
                totalDueMapping[supplier.supplierName] = supplier.totalDue;
            });

            setAccountType(accountTypeMapping);
            setTotalDue(totalDueMapping);
        }
    }, [suppliers]);

    const calculateRefunds = (values) => {
        const buyingPrice = Number(values.buyingPrice) || 0;
        const refundCharge = Number(values.refundCharge) || 0;
        const serviceCharge = Number(values.serviceCharge) || 0;

        const refundFromAirline = buyingPrice - refundCharge;
        const totalCharge = refundCharge + serviceCharge;
        const refundAmount = buyingPrice - totalCharge;

        // Update the calculated values in the form
        form.setFieldsValue({
            refundFromAirline,
            refundAmount,
        });
    };

    const handleValuesChange = (changedValues) => {
        calculateRefunds({
            ...form.getFieldsValue(),
            ...changedValues, // Include the changed values to ensure calculation
        });
    };

    const handleSubmit = async (id, documentNumber, postStatus) => {
        try {
            const { refundCharge, serviceCharge, refundFromAirline, refundAmount } = await form.validateFields();

            const currentDate = new Date();
            const submissionDate = currentDate.toISOString().split('T')[0];

            // Prepare the data for submission
            const dataToSubmit = {
                documentNumber, // Use the document number to find the right sales array
                refundCharge,
                serviceCharge,
                refundFromAirline,
                refundAmount,
                submissionDate,
                isRefunded: 'Yes',
            };

            setLoading(true);
            await axiosUser.patch(`/sale/${id}/isRefund`, dataToSubmit); // Send dataToSubmit directly

            const newStatus = 'Refunded';
            await axiosUser.patch(`/sale/${id}/refundStatus`, { documentNumber, postStatus: newStatus });

            // Check if the supplier account type credit or debit
            const supplierName = selectedSale.supplierName;
            const previousTotalDue = Number(totalDue[supplierName]) || 0;
            let updatedTotalDue = previousTotalDue;

            if (accountType[supplierName] === 'Credit') {
                updatedTotalDue -= refundAmount;
            } else if (accountType[supplierName] === 'Debit') {
                updatedTotalDue += refundAmount;
            }
            
            const submitAsPayment = {
                paidAmount: refundAmount,
                totalDue: updatedTotalDue,
                supplierName: supplierName,
                paymentDate: submissionDate,
            }

            // Make payment request
            await axiosUser.post('/payment', submitAsPayment);

            // Update the total due amount of the selected supplier
            await axiosUser.patch(`/supplier/${supplierName}`, { totalDue: updatedTotalDue });

            // Update the local state to reflect the new total due
            setTotalDue((prevTotalDue) => ({
                ...prevTotalDue,
                [supplierName]: updatedTotalDue,
            }));

            message.success('The sale has been refunded');
            form.resetFields();
            onClose(); // Close modal after submission
            refetch();
        } catch (error) {
            console.error('Failed to submit the form:', error);
            message.error('Failed to process the refund');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Refund Details"
            centered
            open={visible}
            footer={null}
            onCancel={onClose}
        >
            <div className="divider mt-0"></div>
            <Spin spinning={loading}>
                <Form
                    layout="vertical"
                    form={form}
                    initialValues={{ layout: 'vertical' }}
                    onFinish={() => handleSubmit(selectedSale._id, selectedSale.documentNumber, selectedSale.postStatus)}
                    onValuesChange={handleValuesChange} // Set up value change listener
                    style={{ maxWidth: 600 }}
                >
                    <Form.Item
                        label="Net Price"
                        name="buyingPrice"
                        rules={[{ required: true, message: 'Please input the net price!' }]}
                    >
                        <Input type="number" readOnly />
                    </Form.Item>
                    <Form.Item
                        label="Refund Charges"
                        name="refundCharge"
                        rules={[{ required: true, message: 'Please input the refund charges!' }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item
                        label="Service Charges"
                        name="serviceCharge"
                        rules={[{ required: true, message: 'Please input the service charges!' }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item
                        label="Refund from Airline"
                        name="refundFromAirline"
                    >
                        <Input type="number" readOnly />
                    </Form.Item>
                    <Form.Item
                        label="Refund Amount"
                        name="refundAmount"
                    >
                        <Input type="number" readOnly />
                    </Form.Item>

                    <Form.Item className="mt-6 mb-1">
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default RefundSale;

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, ConfigProvider, Modal, Spin, message } from 'antd';
import { createStyles } from 'antd-style';
import { UploadOutlined } from '@ant-design/icons';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import { RiSecurePaymentLine } from 'react-icons/ri';
import axios from 'axios';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

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

const MakePayment = ({ totalDue, selectedSupplierName, refetch, onPaymentSuccess }) => {
    const axiosUser = useAxiosUser();
    const axiosSecure = useAxiosSecure();
    const { styles } = useStyle();
    const [modalOpen, setModalOpen] = useState(false);
    const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting, errors } } = useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (modalOpen) {
            setValue('totalDue', totalDue);
        }
    }, [totalDue, modalOpen]);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
    
            const paidAmount = Number(data.paidAmount) || 0;
            const updatedTotalDue = totalDue - paidAmount;
            const supplierName = selectedSupplierName;
            const currentDate = new Date();
            const submissionDate = currentDate.toISOString().split('T')[0];
            const createdAt = new Date().toISOString();
    
            // Remove manual check for image
            const imageFile = data.image && data.image.length > 0 ? data.image[0] : null;
    
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
    
                const res = await axios.post(image_hosting_api, formData);
                console.log(res);
    
                const receiptUrl = res.data.data.display_url;
                const paymentData = {
                    paidAmount,
                    totalDue: updatedTotalDue,
                    supplierName,
                    paymentDate: submissionDate,
                    receipt: receiptUrl,
                    createdAt, // Add createdAt timestamp here
                };
    
                const response = await axiosSecure.post('/payment', paymentData);
                await axiosUser.patch(`/suppliers/due/${selectedSupplierName}`, { totalDue: updatedTotalDue });
    
                if (response.status === 200) {
                    message.success('Payment submitted successfully');
                    reset();
                    setModalOpen(false);
                    refetch();
                    onPaymentSuccess(paidAmount);
                } else {
                    throw new Error('Failed to submit payment');
                }
            } else {
                // Proceed without an image, if it’s optional
                const paymentData = {
                    paidAmount,
                    totalDue: updatedTotalDue,
                    supplierName,
                    paymentDate: submissionDate,
                    receipt: null, // No receipt URL if no image is uploaded
                    createdAt,
                };
    
                const response = await axiosSecure.post('/payment', paymentData);
                console.log(updatedTotalDue);
                await axiosUser.patch(`/suppliers/due/${selectedSupplierName}`, { totalDue: updatedTotalDue });
    
                if (response.status === 200) {
                    message.success('Payment submitted successfully');
                    reset();
                    setModalOpen(false);
                    refetch();
                    onPaymentSuccess(paidAmount);
                } else {
                    throw new Error('Failed to submit payment');
                }
            }
        } catch (error) {
            console.error('Failed to submit payment:', error);
            message.error(error.message || 'Failed to submit payment');
        } finally {
            setLoading(false);
        }
    };    

    return (
        <>
            <ConfigProvider button={{ className: styles.linearGradientButton }}>
                <Button type="primary" size="large" icon={<RiSecurePaymentLine />} onClick={() => setModalOpen(true)}>
                    Make Payment
                </Button>
            </ConfigProvider>
            <Modal title="Make Payment" centered open={modalOpen} footer={null} onCancel={() => setModalOpen(false)}>
                <Spin spinning={loading || isSubmitting}>
                    <div className='divider'></div>
                    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto space-y-2">
                        <div className="form-control">
                            <label className="label" htmlFor="totalDue">
                                Total Due
                            </label>
                            <input
                                id="totalDue"
                                {...register('totalDue')}
                                className="bg-white input input-bordered w-full"
                                readOnly
                            />
                        </div>

                        <div className="form-control">
                            <label className="label" htmlFor="paidAmount">
                                Amount
                            </label>
                            <input
                                id="paidAmount"
                                {...register('paidAmount', { required: true })}
                                type="number"
                                placeholder="Enter amount"
                                className="bg-white input input-bordered w-full"
                            />
                            {errors.name && <span className="text-red-500">Please input the payment amount</span>}
                        </div>

                        <div className="form-control">
                            <label className="label" htmlFor="difference">
                                Difference
                            </label>
                            <input
                                id="difference"
                                value={totalDue - (Number(watch('paidAmount')) || 0)}
                                className="bg-white input input-bordered w-full"
                                readOnly
                            />
                        </div>

                        <div className="form-control">
                            <div className="label" htmlFor="image">
                                Upload Image
                            </div>
                            <input
                                id="image"
                                {...register('image', { required: false })}
                                type="file"
                                className="bg-white file-input file-input-bordered w-full mb-6"
                            />
                        </div>

                        <div className="form-control mt-6 mb-4">
                            <Button type="primary" className="w-full" htmlType="submit" loading={loading}>
                                Submit
                            </Button>
                        </div>
                    </form>
                </Spin>
            </Modal>
        </>
    );
};

export default MakePayment;
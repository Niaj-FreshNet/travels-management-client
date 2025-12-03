import React, { useEffect, useState } from 'react';
import { Button, ConfigProvider, Modal, Spin, message, notification } from 'antd';
import { createStyles } from 'antd-style';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import { MdUpdate } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import axios from 'axios';

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

const EditPayment = ({ paymentId, isRefunded, refetch }) => {
    const axiosSecure = useAxiosSecure();
    const { styles } = useStyle();
    const [modalOpen, setModalOpen] = useState(false);
    const { register, handleSubmit, setValue, reset, watch, formState: { isSubmitting, errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                setLoading(true);
                const response = await axiosSecure.get(`/payment/${paymentId}`);
                const data = response.data;
                setCurrentImage(data.receipt);
                setValue('newPaidAmount', data.paidAmount);
                setValue('image', []);
            } catch (error) {
                message.error('Failed to fetch payment data');
            } finally {
                setLoading(false);
            }
        };

        if (modalOpen && paymentId) {
            fetchPayment();
        }
    }, [modalOpen, paymentId, setValue, axiosSecure]);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            let receiptUrl;
    
            // Check if an image file was uploaded
            if (data.image && data.image.length > 0) {
                const imageFile = data.image[0];
                const formData = new FormData();
                formData.append('image', imageFile);
    
                const imageResponse = await axios.post(image_hosting_api, formData);
                receiptUrl = imageResponse.data.data.display_url;
            } else {
                // If no new image is uploaded, keep the current image URL
                receiptUrl = currentImage;
            }
    
            // Update payment with the new amount and receipt URL
            await axiosSecure.put(`/payment/${paymentId}`, {
                paidAmount: data.newPaidAmount,
                receipt: receiptUrl,
            });
    
            message.success('Payment updated successfully');
            reset();
            setModalOpen(false);
            refetch(); // Refetch data to update the table
        } catch (error) {
            message.error('Failed to update payment');
        } finally {
            setLoading(false);
        }
    };    

    const handleOpenModal = () => {
        if (isRefunded === 'Yes') {
            notification.warning({
                message: 'This payment is from a refund',
                description: 'You cannot edit a refunded payment.',
                placement: 'topRight',
                duration: 3, // Duration in seconds
            });
        } else {
            setModalOpen(true);
        }
    };

    return (
        <>
            <ConfigProvider button={{ className: styles.linearGradientButton }}>
                <Button type="primary" size="medium" icon={<MdUpdate />} onClick={handleOpenModal}>
                    Edit
                </Button>
            </ConfigProvider>
            <Modal title="Edit Payment" centered open={modalOpen} footer={null} onCancel={() => setModalOpen(false)}>
                <Spin spinning={loading}>
                    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto space-y-2">
                        <div className="form-control">
                            <label className="label" htmlFor="newPaidAmount">
                                New Paid Amount
                            </label>
                            <input
                                id="newPaidAmount"
                                {...register('newPaidAmount', { required: true })}
                                className="bg-white input input-bordered w-full"
                                placeholder="Enter new paid amount"
                            />
                            {errors.newPaidAmount && <span className="text-red-500">Please input the new paid amount</span>}
                        </div>
                        <div className='mb-16'>
                            Current Image
                            {currentImage && (
                                <img src={currentImage} alt="Receipt" style={{ width: '100%', marginTop: '10px' }} />
                            )}
                        </div>
                        <div className="form-control">
                            <div className="label" htmlFor="image">
                                Replace Image
                            </div>
                            <input
                                id="image"
                                {...register('image', { required: false })}
                                type="file"
                                className="bg-white file-input file-input-bordered w-full mb-6"
                            />
                        </div>
                        <div className="form-control mt-6 mb-4">
                            <Button type="primary" className="w-full" htmlType="submit" loading={loading || isSubmitting}>
                                Update
                            </Button>
                        </div>
                    </form>
                </Spin>
            </Modal>
        </>
    );
};

export default EditPayment;
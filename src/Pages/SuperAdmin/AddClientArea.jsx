import { useState } from "react";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { Button, Checkbox, ConfigProvider, Form, Input, Modal, notification, Spin } from "antd";
import { BiSolidUserAccount } from "react-icons/bi";
import { createStyles } from "antd-style";

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


const AddClientArea = ({ refetch }) => {
    const axiosSecure = useAxiosSecure();
    const { styles } = useStyle();
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const clientAreaInfo = {
                officeName: values.officeName,
                officeId: values.officeId,
                officeAddress: values.officeAddress,
                status: 'active',
            };

            const response = await axiosSecure.post('/clientArea', clientAreaInfo);
            console.log('Response from server:', response.data);
            notification.success({
                message: 'ClientArea Created',
                description: 'ClientArea has been created successfully!',
                placement: 'topRight',
            });

            form.resetFields();
            setModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to submit the form:', error);
            const errorMessage = error.response?.data?.message || 'An unknown error occurred.';
            notification.error({
                message: 'Submission Failed',
                description: errorMessage,
                placement: 'topRight',
            });
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
                <Button type="primary" size="large" icon={<BiSolidUserAccount />} onClick={() => setModalOpen(true)}>
                    New ClientArea
                </Button>
            </ConfigProvider>
            <Modal
                title="Add ClientArea"
                centered
                open={modalOpen}
                footer={null}
                onCancel={() => setModalOpen(false)}
            >
                <div className="divider mt-0"></div>
                <Spin spinning={loading}>
                    <Form
                        layout="vertical"
                        form={form}
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            label="Office Name"
                            name="officeName"
                            rules={[{ required: true, message: 'Please input the office name!' }]}
                        >
                            <Input placeholder="Enter office name" />
                        </Form.Item>
                        <Form.Item
                            label="Office ID"
                            name="officeId"
                            rules={[{ required: true, message: 'Please input the office ID!' }]}
                        >
                            <Input placeholder="Enter office ID" />
                        </Form.Item>
                        <Form.Item
                            label="Office Address"
                            name="officeAddress"
                            rules={[{ required: true, message: 'Please input the location!' }]}
                        >
                            <Input placeholder="Enter location" />
                        </Form.Item>
                        <Form.Item
                            name="confirmCheckbox"
                            rules={[{ required: true, message: 'You must confirm before creating a new clientArea!' }]}
                            valuePropName="checked"
                        >
                            <Checkbox>
                                Confirm creation of this ClientArea
                            </Checkbox>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                Create ClientArea
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </>
    );
};

export default AddClientArea;  
import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, ConfigProvider, DatePicker, Form, Input, Layout, message, Modal, notification, Select, Space, Spin, Table, theme } from 'antd';
import { PrinterOutlined, SaveOutlined } from '@ant-design/icons';
import useAxiosUser from '../../../Hooks/useAxiosUser';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import useAirlines from '../../../Hooks/useAirlines';
import useSuppliers from '../../../Hooks/useSuppliers';
import useSales from '../../../Hooks/useSales';
import useAuth from '../../../Hooks/useAuth';
import './EditSale.css';
import './ModalStyles.css';
import { ComponentToPrint } from '../../../Components/Print/ComponentToPrint';
import { useReactToPrint } from 'react-to-print';

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

const PrintModal = ({ visible, onClose, saleData, refetch, loading, setLoading }) => {
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
            iataName: '',
            documentNumber: '',
            supplierName: '',
            accountType: '',
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
    const componentRef = React.useRef(null);


    const handleAfterPrint = React.useCallback(() => {
        console.log("`onAfterPrint` called");
    }, []);

    const handleBeforePrint = React.useCallback(() => {
        console.log("`onBeforePrint` called");
        return Promise.resolve();
    }, []);

    const printFn = useReactToPrint({
        contentRef: componentRef,
        documentTitle: "AwesomeFileName",
        onAfterPrint: handleAfterPrint,
        onBeforePrint: handleBeforePrint,
    });


    const handleClose = () => {
        setClosing(true); // Start the closing animation
        setTimeout(() => {
            setClosing(false);
            onClose(); // Close the modal after the animation duration
        }, 300); // Match the duration to your CSS transition duration
    };

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
                    width={1000}
                    centered
                    className={closing ? 'modal-closing' : 'modal-opening'}
                >
                    <Content style={{ padding: '10px 12px 10px 12px', marginBottom: '-16px' }}>
                        {/* <div className='-mt-2'>
                            <h2 className='text-xl'>Print Sale</h2>
                        </div>
                        <div className='divider mt-2 mb-2'></div> */}
                        <div className=''>
                            <ComponentToPrint ref={componentRef} saleData={saleData}/>
                        </div>

                        <div className='flex justify-end gap-4'>
                            <Button
                                onClick={printFn}
                                type="primary"
                                htmlType="submit"
                                className={styles.linearGradientButton}
                                icon={<PrinterOutlined />}
                                style={{ height: '40px', fontWeight: 'bold' }}
                            >
                                Print
                            </Button>
                            <Button
                                onClick={handleClose}
                                className='btn btn-sm btn-error text-white'
                                style={{ height: '40px' }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Content>
                </Modal>
            )}
        </ConfigProvider>
    );
};

export default PrintModal;

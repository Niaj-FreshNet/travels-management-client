import { BiLinkExternal } from "react-icons/bi";
import useAirlines from "../../Hooks/useAirlines";
import useSuppliers from "../../Hooks/useSuppliers";
import { Link, NavLink } from "react-router-dom";
import { Button, ConfigProvider } from "antd";
import { createStyles } from "antd-style";
import usePayment from "../../Hooks/usePayment";
import useSales from "../../Hooks/useSales";
import useAdmin from "../../Hooks/useAdmin";
import useAuth from "../../Hooks/useAuth";

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


const PaymentCard = () => {
    const { styles } = useStyle();
    const { sales } = useSales();
    const [isAdmin, isAdminLoading] = useAdmin();

    const duePayment = sales.filter(sale => sale.paymentStatus === 'Due');
    const paidPayment = sales.filter(sale => sale.paymentStatus === 'Paid');

    return (
        <>
            {isAdmin ? (
                <div className="border-2 border-white bg-white rounded-xl shadow-lg px-4 pt-4 pb-3">
                    <div className="">
                        <div className="pb-2 px-2">
                            <h2 className="text-xl font-semibold">Payments</h2>
                        </div>
                        <div className="py-0">
                            <div className="border-2 rounded-md">
                                <div className="px-3 pt-2 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <p className="text-md">Due Payments</p>
                                        <div className="flex items-center gap-2">
                                            <div className="badge badge-lg badge-error text-white">{duePayment.length}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="divider my-1"></div>
                                <div className="px-3 pb-2 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <p className="text-md">Paid Payments</p>
                                        <div className="flex items-center gap-2">
                                            <div className="badge badge-lg badge-success text-white">{paidPayment.length}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-3 pb-0">
                                <Link to="/payment/new" >
                                    <ConfigProvider button={{ className: styles.linearGradientButton }}>
                                        <Button style={{ width: '100%' }} type="primary" size="medium" icon={<BiLinkExternal />}>
                                            Make Payment
                                        </Button>
                                    </ConfigProvider>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border-2 border-white bg-white rounded-xl shadow-lg p-4">
            <div className="">
                <div className="pb-2 px-2">
                    <h2 className="text-xl font-semibold">Payments</h2>
                </div>
                <div className="py-3">
                    <div className="border-2 rounded-md">
                        <div className="px-3 pt-2 rounded-lg">
                            <div className="flex justify-between items-center">
                                <p className="text-md">Due Payments</p>
                                <div className="flex items-center gap-2">
                                    <div className="badge badge-lg badge-error text-white">{duePayment.length}</div>
                                </div>
                            </div>
                        </div>
                        <div className="divider my-1"></div>
                        <div className="px-3 pb-2 rounded-lg">
                            <div className="flex justify-between items-center">
                                <p className="text-md">Paid Payments</p>
                                <div className="flex items-center gap-2">
                                    <div className="badge badge-lg badge-success text-white">{paidPayment.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            )}
        </>
    );
};

export default PaymentCard;
import React, { useEffect, useState } from 'react';
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { PiAirplaneTilt } from 'react-icons/pi';
import { MdOutlineInventory2 } from 'react-icons/md';
import { FcSalesPerformance } from 'react-icons/fc';
import { FiDollarSign } from 'react-icons/fi';
import { FaUsers } from 'react-icons/fa';
import { TbCopyCheckFilled } from 'react-icons/tb';
import AirlineCodes from '../Pages/Airlines/Airlines.jsx';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Vendors from '../Pages/Vendors/Vendors';
import Ledger from '../Pages/Ledger/Ledger';
import Users from '../Pages/Users/Users';
import Airlines from '../Pages/Airlines/Airlines.jsx';
import NewSale from '../Pages/Sales/NewSale/NewSale.jsx';
import ManageSales from '../Pages/Sales/ManageSales/ManageSales.jsx';
import ReportList from '../Pages/Sales/ReportList/ReportList.jsx';
import NewPayment from '../Pages/Payment/NewPayment/NewPayment.jsx';
import PaymentList from '../Pages/Payment/PaymentList/PaymentList.jsx';
import RefundList from '../Pages/Payment/RefundList/RefundList.jsx';
import Home from '../Pages/Home/Home.jsx';


const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, path, children) {
    return {
        key,
        icon,
        children,
        label,
        path,
    };
}

const items = [
    getItem('Dashboard', '1', <PieChartOutlined />, '/'),
    getItem('Airlines', '2', <PiAirplaneTilt />, '/airlines'),
    getItem('Vendors', '3', <MdOutlineInventory2 />, '/suppliers'),
    getItem('Sales', 'sub1', <FcSalesPerformance />, null, [
        getItem('New Sale', '4', null, '/sales/new'),
        getItem('Manage Sales', '5', null, '/sales/manage'),
        getItem('Report List', '6', null, '/sales/reports'),
    ]),
    getItem('Payment', 'sub2', <FiDollarSign />, null, [
        getItem('New Payment', '7', null, '/payment/new'),
        getItem('Payment List', '8', null, '/payment/list'),
        getItem('Refund List', '9', null, '/payment/refund'),
    ]),
    getItem('Ledger', '10', <TbCopyCheckFilled />, '/ledger'),
    getItem('Users', '11', <FaUsers />, '/users'),
];

const Dashboard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [collapsedWidth, setCollapsedWidth] = useState(80);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const navigate = useNavigate(); // useNavigate hook to programmatically navigate

    const onMenuClick = ({ key }) => {
        // Flatten the items array to search for the clicked item
        const findPath = (items) => {
            for (const item of items) {
                if (item.key === key) return item.path;
                if (item.children) {
                    const childPath = findPath(item.children);
                    if (childPath) return childPath;
                }
            }
            return null;
        };

        const path = findPath(items);
        if (path) {
            navigate(path);
        }
    };

    const updateCollapsedWidth = () => {
        if (window.innerWidth <= 768) {
            setCollapsedWidth(60);
            setCollapsed(true); // Initially collapse on mobile devices
        } else {
            setCollapsedWidth(80);
            setCollapsed(false); // Initially expand on PC
        }
    };

    useEffect(() => {
        updateCollapsedWidth();
        window.addEventListener('resize', updateCollapsedWidth);
        return () => window.removeEventListener('resize', updateCollapsedWidth);
    }, []);
    
    
    return (
        <Layout
            style={{
                minHeight: '100vh',
            }}
        >
            <Sider collapsible 
            collapsed={collapsed} 
            onCollapse={(value) => setCollapsed(value)}
            collapsedWidth={collapsedWidth}>
                <div className="demo-logo-vertical" />
                <Menu
                    theme="dark"
                    // defaultSelectedKeys={['1']}
                    mode="inline"
                    items={items}
                    onClick={onMenuClick} // handle menu item click
                />
            </Sider>
            <Layout>
                <Content style={{ margin: '0px' }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/airlines" element={<Airlines />} />
                        <Route path="/suppliers" element={<Vendors />} />
                        <Route path="/sales/new" element={<NewSale />} />
                        <Route path="/sales/manage" element={<ManageSales />} />
                        <Route path="/sales/reports" element={<ReportList />} />
                        <Route path="/payment/new" element={<NewPayment />} />
                        <Route path="/payment/list" element={<PaymentList />} />
                        <Route path="/payment/refund" element={<RefundList />} />
                        <Route path="/ledger" element={<Ledger />} />
                        <Route path="/users" element={<Users />} />
                    </Routes>
                </Content>
                <Footer
                    style={{
                        textAlign: 'center',
                    }}
                >
                    <span className='font-bold'>FlyAid Travels ©{new Date().getFullYear()}</span> <br /> Developed by <a href="https://www.thousandwebs.com">#ThousandWebs Inc.</a>
                </Footer>
            </Layout>
        </Layout>
    );
};

export default Dashboard;

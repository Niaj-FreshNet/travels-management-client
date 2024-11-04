import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import SideMenu from '../Shared/SideMenu/SideMenu';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from '../Pages/Home/Home.jsx';
import Airlines from '../Pages/Airlines/Airlines.jsx';
import Vendors from '../Pages/Vendors/Vendors';
import NewSale from '../Pages/Sales/NewSale/NewSale.jsx';
import ManageSales from '../Pages/Sales/ManageSales/ManageSales.jsx';
import ReportList from '../Pages/Sales/ReportList/ReportList.jsx';
import NewPayment from '../Pages/Payment/NewPayment/NewPayment.jsx';
import PaymentList from '../Pages/Payment/PaymentList/PaymentList.jsx';
import RefundList from '../Pages/Payment/RefundList/RefundList.jsx';
import Ledger from '../Pages/Ledger/Ledger';
import Users from '../Pages/Users/Users';
import Profile from '../Pages/Profile/Profile.jsx';
import AllClientArea from '../Pages/SuperAdmin/AllClientArea.jsx';

const { Content, Footer, Sider } = Layout;

const Dashboard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [collapsedWidth, setCollapsedWidth] = useState(80);
    const navigate = useNavigate(); // Hook for navigation

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
        updateCollapsedWidth(); // Check size on initial load
        window.addEventListener('resize', updateCollapsedWidth); // Add resize event listener
        return () => window.removeEventListener('resize', updateCollapsedWidth); // Cleanup listener
    }, []);

    const handleMenuClick = (item) => {
        if (item.path) {
            navigate(item.path); // Navigate to the selected path
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {window.innerWidth > 768 && (
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    collapsedWidth={collapsedWidth}
                    style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}
                >
                    <SideMenu onMenuClick={handleMenuClick} /> {/* Pass handleMenuClick here */}
                </Sider>
            )}
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
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/clientArea" element={<AllClientArea />} />
                    </Routes>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    <span className='font-bold'>Quickway 2 Services ©{new Date().getFullYear()}</span> <br />
                    Developed by <a href="https://www.thousandwebs.com"><span className='italic'>ThousandWebs Inc.</span></a>
                </Footer>
            </Layout>
        </Layout>
    );
};

export default Dashboard;

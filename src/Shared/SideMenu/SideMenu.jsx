import React from 'react';
import { Menu } from 'antd';
import { FaUsers } from 'react-icons/fa';
import { FcPaid, FcSalesPerformance } from 'react-icons/fc';
import { TbCopyCheckFilled } from 'react-icons/tb';
import { MdOutlineInventory2 } from 'react-icons/md';
import { PieChartOutlined } from '@ant-design/icons';
import { PiAirplaneTilt, PiNetworkFill } from 'react-icons/pi';
import useAdmin from '../../Hooks/useAdmin'; // Import useAdmin hook
import { CgProfile } from 'react-icons/cg';
import useIsSuperAdmin from '../../Hooks/useIsSuperAdmin';

function getItem(label, key, icon, path, children) {
    return {
        key,
        icon,
        children,
        label,
        path,
    };
}

const adminItems = [
    getItem('Dashboard', '1', <PieChartOutlined />, '/'),
    getItem('Airlines & Services', '2', <PiAirplaneTilt />, '/airlines'),
    getItem('Vendors', '3', <MdOutlineInventory2 />, '/suppliers'),
    getItem('New Sale ', '4', <FcSalesPerformance />, '/sales/new'),
    getItem('Manage Sales', '5', <FcSalesPerformance />, '/sales/manage'),
    getItem('Report List', '6', <FcSalesPerformance />, '/sales/reports'),
    getItem('New Payment', '7', <FcPaid />, '/payment/new'),
    getItem('Payment List', '8', <FcPaid />, '/payment/list'),
    getItem('Refund List', '9', <FcPaid />, '/payment/refund'),
    getItem('Ledger', '10', <TbCopyCheckFilled />, '/ledger'),
    getItem('Users', '11', <FaUsers />, '/users'),
    getItem('Profile', '12', <CgProfile />, '/profile'),
];

const salesItems = [
    getItem('Dashboard', '13', <PieChartOutlined />, '/'),
    getItem('New Sale ', '14', <FcSalesPerformance />, '/sales/new'),
    getItem('Manage Sales', '15', <FcSalesPerformance />, '/sales/manage'),
    getItem('Report List', '16', <FcSalesPerformance />, '/sales/reports'),
    getItem('Profile', '17', <CgProfile />, '/profile'),
];

const superAdminItems = [
    getItem('Dashboard', '18', <PieChartOutlined />, '/'),
    getItem('ClientArea', '19', <PiNetworkFill />, '/clientArea'),
    getItem('Manage All Users', '20', <FaUsers />, '/users'),
    getItem('Airlines & Services', '21', <PiAirplaneTilt />, '/airlines'),
    getItem('All Vendors', '22', <MdOutlineInventory2 />, '/suppliers'),
    getItem('New Sale ', '23', <FcSalesPerformance />, '/sales/new'),
    getItem('Manage All Sales', '24', <FcSalesPerformance />, '/sales/manage'),
    getItem('Sales Report List', '25', <FcSalesPerformance />, '/sales/reports'),
    getItem('New Payment', '26', <FcPaid />, '/payment/new'),
    getItem('All Payment List', '27', <FcPaid />, '/payment/list'),
    getItem('All Refund List', '28', <FcPaid />, '/payment/refund'),
    getItem('Ledger', '29', <TbCopyCheckFilled />, '/ledger'),
    getItem('Profile', '30', <CgProfile />, '/profile'),
];

const SideMenu = ({ onMenuClick }) => {
    const [isAdmin, isAdminLoading] = useAdmin();
    const [isSuperAdmin, isSuperAdminLoading] = useIsSuperAdmin();

    // // Conditionally set menu items based on the user role
    // const items = isAdmin ? adminItems : salesItems;

    // Conditionally set menu items based on the user role
    let items;
    if (isSuperAdmin) {
        items = superAdminItems;
    } else if (isAdmin) {
        items = adminItems;
    } else {
        items = salesItems;
    }
    

    return (
        <Menu
            theme="dark"
            mode="inline"
            items={items.map(item => ({
                ...item,
                onClick: item.children ? undefined : () => onMenuClick(item), // Set onClick for items without children
            }))}
            style={{ height: '100%', borderRight: 0 }}
            onClick={({ item }) => {
                const selectedItem = items.find(i => i.key === item.key);
                if (selectedItem) {
                    onMenuClick(selectedItem); // Call the menu click function
                }
            }}
        />
    );
};

export default SideMenu;

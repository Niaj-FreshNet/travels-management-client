import React from 'react';
import { Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';
import { FcDonate, FcPaid, FcSalesPerformance } from 'react-icons/fc';
import { FiDollarSign } from 'react-icons/fi';
import { TbCopyCheckFilled } from 'react-icons/tb';
import { MdOutlineInventory2 } from 'react-icons/md';
import { PieChartOutlined } from '@ant-design/icons';
import { PiAirplaneTilt } from 'react-icons/pi';

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
    // getItem('Sales', 'sub1', <FcSalesPerformance />, null, [
    // ]),
    getItem('New Sale ', '4', <FcSalesPerformance />, '/sales/new'),
    getItem('Manage Sales', '5', <FcSalesPerformance />, '/sales/manage'),
    getItem('Report List', '6', <FcSalesPerformance />, '/sales/reports'),
    // getItem('Payment', 'sub2', <FiDollarSign />, null, [
    // ]),
    getItem('New Payment', '7', <FcPaid />, '/payment/new'),
    getItem('Payment List', '8', <FcPaid />, '/payment/list'),
    getItem('Refund List', '9', <FcPaid />, '/payment/refund'),
    getItem('Ledger', '10', <TbCopyCheckFilled />, '/ledger'),
    getItem('Users', '11', <FaUsers />, '/users'),
];

const SideMenu = ({ onMenuClick }) => {
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

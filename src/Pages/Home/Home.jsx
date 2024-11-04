import { Card, Col, Layout, Row, Table, Tag, theme } from 'antd';
import { useEffect, useState } from 'react';
import RecentSales from './RecentSales';
import WelcomeCard from './WelcomeCard';
import PaymentCard from './PaymentCard';
import ProfitCard from './ProfitCard';
import ProfitChart from './ProfitChart/ProfitChart';
import useAuth from '../../Hooks/useAuth';
import useAdmin from '../../Hooks/useAdmin';
import UserCard from './UserCard';
import useIsSuperAdmin from '../../Hooks/useIsSuperAdmin';
import { CrownOutlined } from '@ant-design/icons';
import SuperAdminCard from './SuperAdminCard';


const { Header, Content } = Layout;

const Home = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
    const [isAdmin, isAdminLoading] = useAdmin();
    const [isSuperAdmin, isSuperAdminLoading] = useIsSuperAdmin();


    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setMarginStyle({ margin: '0 8px 0 8px' });
            } else if (window.innerWidth >= 1200) {
                setMarginStyle({ margin: '0 16px 0 16px' });
            } else {
                setMarginStyle({ margin: '0 8px 0 16px' });
            }
        };

        // Initialize the margin style based on the current window size
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();


    return (
        <div className="px-4 md:px-8 pb-8">

            {/* Render SuperAdminCard only if the user is a super-admin
            {isSuperAdmin ? (
                <div className='my-auto mx-auto w-full'>
                    <SuperAdminCard />
                </div>
            ) : (
                null
            )} */}
            <h2 className="text-3xl font-bold px-4 pt-4 pb-2">Dashboard</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 items-baseline gap-x-6 gap-y-10 py-4'>
                <div>
                    <WelcomeCard />
                </div>
                <div>
                    <PaymentCard />
                </div>
                <div>
                    {isAdmin || isSuperAdmin ? (
                        <ProfitCard />
                    ) : (
                        <UserCard />
                    )}
                </div>
            </div>

            {isAdmin || isSuperAdmin ? (
                <div className='mt-8'>
                    <ProfitChart />
                </div>
            ) : (
                null
            )}

            <div className="mt-8">
                <div>
                    <RecentSales />

                </div>
            </div>

        </div>
    );
};
export default Home;

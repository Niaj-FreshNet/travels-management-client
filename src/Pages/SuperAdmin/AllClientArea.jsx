import { useEffect, useState } from "react";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import useClientArea from "../../Hooks/useClientArea";
import { Breadcrumb, Button, Layout, message, Popconfirm, Space, Spin, Table, Tag, theme } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Content, Header } from "antd/es/layout/layout";
import AddClientArea from "./AddClientArea";

const AllClientArea = () => {
    const axiosSecure = useAxiosSecure();
    const { clientArea, refetch, isLoading, isError } = useClientArea();
    const [deletingItemId, setDeletingItemId] = useState(null);
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
    const [marginStyle, setMarginStyle] = useState({ margin: '0 4px 0 16px' });
    console.log(clientArea)

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

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const deleteClientArea = async (id) => {
        setDeletingItemId(id);
        try {
            await axiosSecure.delete(`/clientArea/${id}`);
            message.success('ClientArea deleted successfully');
            setDeletingItemId(null);
            refetch();
        } catch (err) {
            console.error('Error deleting client area:', err);
            message.error('Failed to delete client area');
            setDeletingItemId(null);
        }
    };

    const columns = [
        {
            title: 'Serial',
            dataIndex: 'serial',
            key: 'serial',
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Office Name',
            dataIndex: 'officeName',
            key: 'officeName',
            align: 'center',
        },
        {
            title: 'Office ID',
            dataIndex: 'officeId',
            key: 'officeId',
            align: 'center',
        },
        {
            title: 'Address',
            dataIndex: 'officeAddress',
            key: 'officeAddress',
            align: 'center',
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            align: 'center',
            render: (status) => <Tag color={status === 'active' ? 'green' : 'red'}>{status.toUpperCase()}</Tag>,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Popconfirm
                        title="Delete the ClientArea"
                        description="Are you sure to delete this ClientArea?"
                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                        onConfirm={() => deleteClientArea(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary" danger loading={deletingItemId === record._id}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Loading..." />
            </div>
        );
    }

    return (
        <>
            <Header
                className='flex justify-between items-center shadow-lg py-4 pl-4 pr-3 md:px-8'
                style={{ background: colorBgContainer }}
            >
                <div>
                    <h2 className='text-2xl md:text-4xl font-bold'>ClientArea List</h2>
                </div>
                <div className='mt-1'>
                    <AddClientArea refetch={refetch} />
                </div>
            </Header>
            <Content style={marginStyle}>
                <Breadcrumb
                    style={{ margin: '16px 0' }}
                    items={[
                        {
                            title: 'Home',
                        },
                        {
                            title: 'clientArea',
                        },
                    ]}
                />
                <div
                    style={{
                        minHeight: 360,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Table
                        columns={columns}
                        dataSource={clientArea}
                        loading={isLoading}
                        rowKey="_id"
                        pagination={false}
                        scroll={{ x: 'max-content' }} // Enable horizontal scroll if needed
                    />
                </div>
            </Content>
        </>
    );
};

export default AllClientArea;  
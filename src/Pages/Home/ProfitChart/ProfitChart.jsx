import React, { useMemo, useState } from 'react';
import { Card, Tabs } from 'antd';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import useSales from "../../../Hooks/useSales";
import dayjs from 'dayjs';
import "./style.css"

const { TabPane } = Tabs;

const prepareData = (sales, view) => {
    const profitData = {};

    sales.forEach(sale => {
        let key;
        switch (view) {
            case 'day':
                key = dayjs(sale.date).format('YYYY-MM-DD');
                break;
            case 'month':
                key = dayjs(sale.date).format('YYYY-MM');
                break;
            case 'year':
                key = dayjs(sale.date).format('YYYY');
                break;
            default:
                key = dayjs(sale.date).format('YYYY-MM-DD');
        }

        if (!profitData[key]) {
            profitData[key] = 0;
        }
        profitData[key] += sale.totalProfit;
    });

    return Object.keys(profitData).map(key => ({
        date: key,
        profit: profitData[key],
    }));
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="label">{`${label}`}</p>
                <p className="desc">{`Profit: ${payload[0].value.toFixed(2)}`}</p>
            </div>
        );
    }

    return null;
};

const ProfitChart = () => {
    const { sales } = useSales();
    const [view, setView] = useState('day');

    const data = useMemo(() => prepareData(sales, view), [sales, view]);

    return (
        <Card title={<h3 className="text-2xl font-bold px-1 py-3">Profit Graph</h3>} bordered={false} style={{ borderRadius: '14px', borderColor: '#FFFFFF', boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)' }}>
            <Tabs defaultActiveKey="day" onChange={setView} style={{ marginTop: '-16px' }}>
                <TabPane tab="Day" key="day">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="date" stroke="#8884d8" />
                            <YAxis stroke="#8884d8" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" height={36} />
                            <Area type="monotone" dataKey="profit" stroke="#8884d8" fillOpacity={1} fill="url(#colorProfit)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </TabPane>
                <TabPane tab="Month" key="month">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="date" stroke="#82ca9d" />
                            <YAxis stroke="#82ca9d" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" height={36} />
                            <Area type="monotone" dataKey="profit" stroke="#82ca9d" fillOpacity={1} fill="url(#colorProfit)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </TabPane>
                <TabPane tab="Year" key="year">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="date" stroke="#ffc658" />
                            <YAxis stroke="#ffc658" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" height={36} />
                            <Area type="monotone" dataKey="profit" stroke="#ffc658" fillOpacity={1} fill="url(#colorProfit)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </TabPane>
            </Tabs>
        </Card>
    );
};

export default ProfitChart;

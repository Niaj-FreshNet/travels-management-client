import React, { useMemo, useState } from 'react';
import { Card, Tabs } from 'antd';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import useSales from "../../../Hooks/useSales";
import dayjs from 'dayjs';
import "./style.css";

const { TabPane } = Tabs;

// Prepare data for the chart based on the selected view (day, month, year)
const prepareData = (sales, view) => {
    const profitData = {};

    sales.forEach(sale => {
        const profit = sale.sellPrice - sale.buyingPrice; // Calculate profit for each sale
        const key = dayjs(sale.date).format(view === 'day' ? 'YYYY-MM-DD' : view === 'month' ? 'YYYY-MM' : 'YYYY');

        if (!profitData[key]) {
            profitData[key] = 0;
        }
        profitData[key] += profit; // Accumulate profit for the specific time period
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
    const { sales } = useSales(); // Fetch sales data using custom hook
    const [view, setView] = useState('day'); // Default view set to 'day'

    // Prepare the data based on the selected view
    const data = useMemo(() => prepareData(sales, view), [sales, view]);

    return (
        <Card title={<h3 className="text-2xl font-bold px-1 py-3">Profit Graph</h3>} bordered={false} style={{ borderRadius: '14px', borderColor: '#FFFFFF', boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)' }}>
            <Tabs defaultActiveKey="day" onChange={setView} style={{ marginTop: '-16px' }}>
                <TabPane tab="Day" key="day">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="date" stroke="#8884d8" />
                            <YAxis stroke="#8884d8" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" height={36} />
                            <Bar dataKey="profit" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </TabPane>
                <TabPane tab="Month" key="month">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="date" stroke="#82ca9d" />
                            <YAxis stroke="#82ca9d" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" height={36} />
                            <Bar dataKey="profit" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </TabPane>
                <TabPane tab="Year" key="year">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="date" stroke="#ffc658" />
                            <YAxis stroke="#ffc658" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" height={36} />
                            <Bar dataKey="profit" fill="#ffc658" />
                        </BarChart>
                    </ResponsiveContainer>
                </TabPane>
            </Tabs>
        </Card>
    );
};

export default ProfitChart;
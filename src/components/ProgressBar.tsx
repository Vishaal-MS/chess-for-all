
import {BarChart, CartesianGrid, ResponsiveContainer, XAxis,YAxis,Tooltip,Bar,Legend} from "recharts";
import React from "react";
import {Line, LineChart,Label} from "recharts";
export const ProgressBar = (data,dataKey1,dataKey2) => {
    const data1 = [
        {
            name: 'Payment Status',
            received: 80, // Payment received percentage
            pending: 20,   // Payment pending percentage
        },
    ];
    return (
        <ResponsiveContainer width="100%" height={"100"}>
            <BarChart data={data1}>
                <Bar dataKey="received" fill="green" />
                <Bar dataKey="pending" fill="blue" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export const ProgressChart = ({ receivedPercentage, pendingPercentage }) => {
    const data = [
        {
            name: 'Progress',
            received: receivedPercentage,
            pending: pendingPercentage,
        },
    ];

    return (
        <ResponsiveContainer width="100%" height={40}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Line
                    type="monotone"
                    dataKey="received"
                    stroke="#4caf50"
                    strokeWidth={5}
                    dot={false}
                    activeDot={{ r: 8 }}
                >
                    <Label
                        value={`${receivedPercentage}%`}
                        position="insideTopLeft"
                        style={{ fontSize: 14, fontWeight: 'bold', fill: '#ffffff' }}
                    />
                </Line>
                <Line
                    type="monotone"
                    dataKey="pending"
                    stroke="#ff9800"
                    strokeWidth={5}
                    dot={false}
                    activeDot={{ r: 8 }}
                >
                    <Label
                        value={`${pendingPercentage}%`}
                        position="insideTopRight"
                        style={{ fontSize: 14, fontWeight: 'bold', fill: '#ffffff' }}
                    />
                </Line>
            </LineChart>
        </ResponsiveContainer>
    );
};
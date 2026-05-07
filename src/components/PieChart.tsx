import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,Label } from 'recharts';
import { Box, Typography } from '@mui/material';
import {formatAmount} from "../utils";
import {CardWithIcon} from "./CardWithIcon";

export const GenericPieChart = ({
                                    data,
                                    colors = ['#4caf50', '#2196f3', '#f44336', '#ff9800', '#9c27b0', '#00bcd4'], // default colors
                                    chartIcon,title,isAmount
                                }) => {
    // Calculate the total value from the data
    const totalValue = data.reduce((acc, entry) => acc + entry.value, 0);

    // Formatter function that depends on the `isAmount` prop
    const legendFormatter = (value, entry, index) => {
        const dataValue = data[index].value;

        // If `isAmount` is true, format as currency
        if (isAmount === true) {

            return `${value}: ${formatAmount(dataValue)}`;
        }
        // If `isAmount` is false, return the raw value
        return `${value}: ${dataValue}`;
    };

    return (
        <div style={{ position: 'relative', width:200, height: 230}}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="60%" cy="50%" innerRadius={50} outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    {/* Legend positioned to the right of the chart */}
                    <Legend
                        layout="horizontal"
                        horizontalAlign="bottom"
                        align="left"
                        wrapperStyle={{
                            position: 'absolute',
                            right: '-5px',
                            top: '90%',
                            transform: 'translateY(-50%)',
                            fontSize: '12px', // Reduced font size for the legend
                        }}
                        formatter = {legendFormatter}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Title Above the Icon */}
            <div
                style={{
                    position: 'absolute',
                    top: '5%',
                    left: '60%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                    color: 'BLUE',
                    fontWeight: 'bold',
                }}
            >
                {/*{totalText?totalText:null}*/}
                {title?title:null}
            </div>

            {/* Center Icon */}
            <div
                style={{
                    position: 'absolute',
                    top: '42%',
                    left: '60%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '24px',
                    color: 'BLUE'
                }}
            >
                {chartIcon}
            </div>

            {/* Total value below the Icon */}
           {/* <div
                style={{
                    position: 'absolute',
                    top: '65%',
                    left: '60%',
                    transform: 'translateX(-50%)',
                    fontSize: '20px',
                    color: 'BLUE',
                    fontWeight: 'bold',
                }}
            >
                {totalText?totalValue:null}
            </div>*/}
        </div>
    );
};

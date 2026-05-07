import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography, Box } from '@mui/material';

// Generic Chart Component
export const GenericLineChart = ({
                              data,
                              xAxisKey,
                              lineDataKeys,
                              lineNames,
                              lineColors,
                              title,
                              yAxisFormatter,
                              xAxisAngle = -45,
                              fontSize = '0.8rem',
                              paddingBottom = '20px'
                          }) => {

    const formatAmount = (amount) => {
        if (yAxisFormatter) {
            return yAxisFormatter(amount);
        }
        return '$' + new Intl.NumberFormat('en-US').format(amount);
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Title */}
            <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: 2, fontSize: '1rem' }}>
                {title}
            </Typography>

            {/* Line Chart */}
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />

                    {/* X-Axis with customizable props */}
                    <XAxis
                        dataKey={xAxisKey}
                        angle={xAxisAngle}
                        textAnchor="end"
                        style={{ fontSize }}
                    />

                    {/* Y-Axis with customizable formatter */}
                    <YAxis
                        tickFormatter={formatAmount}
                        style={{ fontSize }}
                    />

                    {/* Tooltip with customizable font size */}
                    <Tooltip formatter={(value) => formatAmount(value)} labelStyle={{ fontSize }} />

                    {/* Legend with padding */}
                    <Legend
                        verticalAlign="top"
                        wrapperStyle={{ fontSize, paddingBottom }}
                    />

                    {/* Dynamic Lines based on dataKeys and colors */}
                    {lineDataKeys.map((lineDataKey, index) => (
                        <Line
                            key={lineDataKey}
                            type="monotone"
                            dataKey={lineDataKey}
                            stroke={lineColors[index] || '#8884d8'}
                            strokeWidth={3}
                            name={lineNames[index] || lineDataKey}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
};


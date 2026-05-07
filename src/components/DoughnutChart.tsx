import React from 'react';
import {PieChart, Pie, Cell, Legend, Tooltip, Label, ResponsiveContainer} from 'recharts';
import { Typography } from '@mui/material';

// Sample data for the classes


// Custom Legend component to show both label and count with percentages
const CustomLegend = ({ payload,data }) => {
    const totalValue = data.reduce((sum, entry) => sum + entry.value, 0);
    return (
        <div>
            {payload.map((entry, index) => {
                const percentage = ((entry.payload.value / totalValue) * 100).toFixed(0);
                return (
                    <div display={'flex'}  key={index} style={{ marginBottom: '5px' }}>

                        <Typography variant="body2">
                            <span style={{ color: entry.color, marginRight: '10px' }}>●</span>
                            <span style={{ color: entry.color, marginRight: '10px',fontSize: '20px' }}>{entry.payload.value}</span>
                            <span style={{ color: entry.color, marginRight: '10px',fontSize: '14px' }}>{entry.payload.name}</span>
                        </Typography>
                    </div>
                );
            })}
        </div>
    );
};

export const DoughnutChart = (props:{data}) => {
    var data = props.data;
    const totalValue = data.reduce((sum, entry) => sum + entry.value, 0);

    // Calculate percentage for the center label (example with "Classes Completed")
    const completedPercentage = ((data[2].value / totalValue) * 100).toFixed(0);

    return (
        <ResponsiveContainer>
        <PieChart width={500} height={200}>
            <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="60%" // Makes it a doughnut chart
                outerRadius="80%"
                fill="#8884d8"
                labelLine={false}

            >
                {data.map((entry, index) => (
                    <Cell
                        key={`cell-${index}`}
                        fill={['blue', 'green', 'orange'][index]}
                    />
                ))}
                {/* Display the percentage inside the doughnut */}
                <Label
                    value={`${completedPercentage}%`}
                    position="center"
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        fill: '#333',
                    }}
                />
            </Pie>
            <Tooltip />
            <Legend content={<CustomLegend data={props.data}/>} layout="vertical" // Position the legend vertically
                    align="right"     // Align the legend to the right
                    verticalAlign="middle"
                    // Position the legend vertically in the middle of the chart
             />
        </PieChart>
        </ResponsiveContainer>
    );
};

export default DoughnutChart;

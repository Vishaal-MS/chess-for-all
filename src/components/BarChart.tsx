import React from 'react';
import {Box, Typography} from '@mui/material';
import {Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {formatAmount} from "../utils";


export const GenericBarChart = ({titleComponent,footerComponent,data,XAxisDataKey,YAxisDataKey,width,height}) => {
    return (
         <Box sx={{  width: "100%", height:280}}>
            {/* Title */}

            { titleComponent ? titleComponent : null }

            {/* Line Chart */}
        <ResponsiveContainer width="100%">
            <BarChart
                width={width}
                height={height}
                data={data}
                margin={{
                    top: 25,
                    right: 30,
                    left: 20,
                    bottom: 15,
                }}
            >
                <XAxis dataKey={XAxisDataKey} angle={-20} textAnchor="end" style={{ fontSize: '1.1rem' }}/>
                <YAxis tickFormatter={formatAmount} style={{ fontSize: '1.1rem' }}/>
                {/*<Legend verticalAlign="top" wrapperStyle={{ fontSize: '0.8rem',paddingBottom: '20px'}}/>*/}
                <Tooltip formatter={(value) => formatAmount(value)} />
                <Bar dataKey={YAxisDataKey} fill="#8884d8" barSize={30}/>
                {/*<Bar dataKey="uv" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />} />*/}
                </BarChart>
              </ResponsiveContainer>
             {footerComponent?footerComponent:null}
         </Box>
    );
};

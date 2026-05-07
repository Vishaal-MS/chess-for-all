import React, { useState, useEffect } from 'react';
import { Card, Button, Box, Typography, Grid } from '@mui/material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function generateDayWiseAndWeekWiseData(dateWiseData) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();

    const thisMonday = new Date(now);
    const day = thisMonday.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    thisMonday.setDate(thisMonday.getDate() + diffToMonday);
    thisMonday.setHours(0, 0, 0, 0);

    const thisSunday = new Date(thisMonday);
    thisSunday.setDate(thisMonday.getDate() + 6);
    thisSunday.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(now.getDate() - 7 * 12);

    const weekMap = new Map();
    const filteredData = dateWiseData.filter(entry => {
        const date = new Date(entry.date);
        return date >= startDate && date <= now;
    });

    const dayWiseMap = new Map();
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(thisMonday);
        dayDate.setDate(thisMonday.getDate() + i);
        const dayName = dayNames[dayDate.getDay()];
        dayWiseMap.set(dayName, 0);
    }

    filteredData.forEach(entry => {
        const date = new Date(entry.date);

        if (date >= thisMonday && date <= thisSunday) {
            const dayName = dayNames[date.getDay()];
            dayWiseMap.set(dayName, (dayWiseMap.get(dayName) || 0) + entry.hours);
        }

        const monday = new Date(date);
        const day = monday.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        monday.setDate(monday.getDate() + diffToMonday);
        monday.setHours(0, 0, 0, 0);
        const key = monday.toISOString().split('T')[0];

        if (!weekMap.has(key)) {
            weekMap.set(key, { weekStart: key, hours: 0 });
        }
        weekMap.get(key).hours += entry.hours;
    });

    const dayWiseData = Array.from(dayWiseMap.entries()).map(([day, hours]) => ({ day, hours }));

    const fullWeeks = [];
    const currentMonday = new Date(thisMonday);
    for (let i = 11; i >= 0; i--) {
        const monday = new Date(currentMonday);
        monday.setDate(monday.getDate() - i * 7);

        const startOfWeek = new Date(monday);
        const endOfWeek = new Date(monday);
        endOfWeek.setDate(endOfWeek.getDate() + 6);

        const options = { month: 'short', day: '2-digit' };
        const label = `${startOfWeek.toLocaleDateString("en-US", options)}–${endOfWeek.toLocaleDateString("en-US", options)}`;

        const key = monday.toISOString().split('T')[0];
        const hours = weekMap.has(key) ? weekMap.get(key).hours : 0;
        fullWeeks.push({ week: label, hours });
    }

    return { dayWiseData, weekWiseData: fullWeeks };
}

export const ActivityHoursChart = () => {
    const [view, setView] = useState('This Week');
    const [data, setData] = useState([]);

    const dateWiseData = [
        { date: '2025-03-10', hours: 2 },
        { date: '2025-03-12', hours: 4 },
        { date: '2025-03-14', hours: 3 },
        { date: '2025-03-17', hours: 5 },
        { date: '2025-03-18', hours: 2 },
        { date: '2025-03-24', hours: 3 },
        { date: '2025-03-25', hours: 2 },
        { date: '2025-03-31', hours: 4 },
        { date: '2025-04-02', hours: 5 },
        { date: '2025-04-07', hours: 3 },
        { date: '2025-04-09', hours: 2 },
        { date: '2025-04-14', hours: 6 },
        { date: '2025-04-16', hours: 2 },
        { date: '2025-04-21', hours: 4 },
        { date: '2025-04-22', hours: 1 },
        { date: '2025-04-28', hours: 5 },
        { date: '2025-04-30', hours: 2 },
        { date: '2025-05-05', hours: 3 },
        { date: '2025-05-06', hours: 4 }
    ];

    useEffect(() => {
        const { dayWiseData, weekWiseData } = generateDayWiseAndWeekWiseData(dateWiseData);
        setData(view === 'This Week' ? dayWiseData : weekWiseData);
    }, [view]);

    return (
        <>
            <Grid container spacing={2} alignItems="center">
                <Grid item>
                    <Button
                        variant={view === 'This Week' ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={() => setView('This Week')}
                    >
                        This Week
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        variant={view === 'Last 12 Weeks' ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={() => setView('Last 12 Weeks')}
                    >
                        Last 12 Weeks
                    </Button>
                </Grid>
                <Grid item>
                    <Typography variant="h5" gutterBottom>
                        Learning Hours
                    </Typography>
                </Grid>
            </Grid>

            <Card sx={{ marginTop: 3 }}>
                <Box sx={{ padding: 2 }}>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={view === 'This Week' ? 'day' : 'week'} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="hours" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </Card>
        </>
    );
};

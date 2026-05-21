import {useEffect} from 'react';
import {Grid, Button, Box} from '@mui/material';
import {GenericLineChart} from "../../components/LineChart";
import {DBCard} from "../../components/DBCard";
import {ResourceContextProvider,List,DateField,Link,FunctionField,Title} from "react-admin";
import {useState} from "react";
import {formatCurrency} from "../../utils";
import {DataTable, remoteLog} from '@mahaswami/vc-frontend';
import {CurriculumsReferenceField} from "../curriculums.tsx";
import {ClientsReferenceField} from "../clients.tsx";

const clientwisepayments = [
    {
        month: 'Aug 2024',
        client1: 17800,
        client2: 22000,
        client3: 12000
    },
    {
        month: 'Sep 2024',
        client1: 27800,
        client2: 24000,
        client3: 15000
    },
    {
        month: 'Oct 2024',
        client1: 40000,
        client2: 29000,
        client3: 20000
    },
    {
        month: 'Nov 2024',
        client1: 30000,
        client2: 31000,
        client3: 18000
    },
    {
        month: 'Dec 2024',
        client1: 20000,
        client2: 25000,
        client3: 22000
    },
    {
        month: 'Jan 2025',
        client1: 48900,
        client2: 42000,
        client3: 25000
    }
];

const classwisepayments = [
    {
        month: 'Aug 2024',
        class1: 42000,
        class2: 21000,
        class3: 38000
    },
    {
        month: 'Sep 2024',
        class1: 37800,
        class2: 22000,
        class3: 40000
    },
    {
        month: 'Oct 2024',
        class1: 40000,
        class2: 21000,
        class3: 35000
    },
    {
        month: 'Nov 2024',
        class1: 38000,
        class2: 26000,
        class3: 38000
    },
    {
        month: 'Dec 2024',
        class1: 40000,
        class2: 25000,
        class3: 43000
    },
    {
        month: 'Jan 2025',
        class1: 41900,
        class2: 20000,
        class3: 44000
    }
];

const formatAmount = (amount) => `$${amount.toLocaleString()}`;

const sort = { field: 'date', order: 'DESC' };

export const regroupPayments = (payments) => {

// Function to convert date to Month-Year format
    const getMonthYear = (dateStr) => {
        const [day, month, year] = dateStr.split('-');
        const date = new Date(`${year}-${month}-${day}`);
        return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    };

// Grouping and restructuring the data
    const result = payments.reduce((acc, item) => {
        const monthYear = getMonthYear(item.date);
        const classKey = `class${item.curriculum_id}`;
        const clientKey = `client${item.client_id}`;
        const amount = parseInt(item.amount, 10);

        let monthData = acc.find(entry => entry.month === monthYear);
        if (!monthData) {
            monthData = { month: monthYear };
            acc.push(monthData);
        }

        monthData[classKey] = (monthData[classKey] || 0) + amount;
        monthData[clientKey] = (monthData[clientKey] || 0) + amount;
        return acc;
    }, []);

// Sort the result by month (optional, if you want chronological order)
    result.sort((a, b) => new Date(`01-${a.month}`) - new Date(`01-${b.month}`));

    console.log(result);
    return result;
}

export const BillingView = () => {

    const dataProvider = window.swanAppFunctions.dataProvider;
    const[monthwisePayments, setMonthwisePayments] = useState([]);
    const [classWiseDataKeys, setClassWiseDataKeys] = useState([]);
    const [classWiseLineNames, setClassWiseLineNames] = useState([]);
    const [classWiseLineColors, setClassWiseLineColors] = useState([]);
    const [clientWiseDataKeys, setClientWiseDataKeys] = useState([]);
    const [clientWiseLineNames, setClientWiseLineNames] = useState([]);
    const [clientWiseLineColors, setClientWiseLineColors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Predefined color palette (extend as needed)
    const colorPalette = [
        "#8884d8", // Purple
        "#82ca9d", // Green
        "#ffc658", // Yellow
        "#ff7300", // Orange
        "#0088fe", // Blue
        "#ff4444", // Red
        "#00c49f", // Teal
        "#a4de6c", // Light Green
        "#d0ed57", // Lime
        "#8dd1e1"  // Light Blue
    ];

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const {data: allPayments} = await dataProvider.getList('payments',{
                });
            console.log('Retrieved Payments',allPayments);
            const classWisePayments = regroupPayments(allPayments);
            setMonthwisePayments(classWisePayments);
            console.log('Testing Conversion Data',classWisePayments);
            // Extract unique class keys
            const uniqueClassKeys = Array.from(
                new Set(classWisePayments.flatMap(item => Object.keys(item).filter(key => key.startsWith('class'))))
            );

            //Extract unique client keys
            const uniqueClientKeys = Array.from(
                new Set(classWisePayments.flatMap(item => Object.keys(item).filter(key => key.startsWith('client'))))
            );
            console.log('Unique Class Keys',uniqueClassKeys);
            console.log('Unique Client Keys',uniqueClientKeys);
            setClassWiseDataKeys(uniqueClassKeys);
            setClientWiseDataKeys(uniqueClientKeys);

                //Generate an array of line colors based on the count of unique class keys
                const classLineColors = uniqueClassKeys.map((_, index) => {
                    return colorPalette[index % colorPalette.length];
                });
                setClassWiseLineColors(classLineColors);

                //Generate an array of line colors based on the count of unique client keys
                const clientLineColors = uniqueClientKeys.map((_, index) => {
                    return colorPalette[index % colorPalette.length];
                });
                setClientWiseLineColors(clientLineColors);
            //Generate an array of class names from dataprovider for each unique class key
            const classNames = await Promise.all(
                uniqueClassKeys.map(key => dataProvider.getOne('classes', {id: key.replace('class', '')})
                    .then(({data}) => data.name)
                )
            );
            console.log('Class Names',classNames);


            setClassWiseLineNames(classNames);
            //Generate an array of client names from dataprovider for each unique client key
            const clientNames = await Promise.all(
                uniqueClientKeys.map(key => dataProvider.getOne('clients', {id: key.replace('client', '')})
                    .then(({data}) => data.name)
                )
            );
            console.log('Client Names',classNames);
            setClientWiseLineNames(clientNames);

            }
            catch (err) {
                setError(err);
                setLoading(false);
                remoteLog("Error sending on Billing fetchPayments method: ", error);
            }

        };
        fetchPayments();
    }, []);

    return(
        <Box>
            <Title title="Billing" />
            <Grid container spacing={3} style={{ padding: '12px' }}>
                <Grid item xs={6}>
                    <DBCard title = "Class Wise Payments" component={<GenericLineChart
                        data={monthwisePayments}
                        xAxisKey="month"
                       // lineDataKeys={['class1', 'class2', 'class3']}
                        lineDataKeys={classWiseDataKeys}
                      //  lineNames={['Beginner Chess 101', 'Advanced Tactics', 'Opening Moves']}
                        lineNames={classWiseLineNames}
                       // lineColors={['#8884d8', '#82ca9d', '#ff7300']}
                        lineColors={classWiseLineColors}
                      //  title="Class Wise Payments"
                        yAxisFormatter={formatAmount}
                        fontSize="1rem"
                        paddingBottom="20px"
                    />} color={"green"}/>

                </Grid>
                <Grid item xs={6}>
                    <DBCard title = "Client Wise Payments" component={
                    <GenericLineChart
                        data={monthwisePayments}
                        xAxisKey="month"
                       // lineDataKeys={['client1', 'client2', 'client3']}
                        lineDataKeys={clientWiseDataKeys}
                       // lineNames={['GNS Whitefield', 'Ekya National', 'Sanathan Public College']}
                        lineNames={clientWiseLineNames}
                       // lineColors={['#8884d8', '#82ca9d', '#ff7300']}
                        lineColors={clientWiseLineColors}
                        //title="Client Wise Payments"
                        yAxisFormatter={formatAmount}
                        fontSize="1rem"
                        paddingBottom="20px"
                    />} color={"green"}/>
                </Grid>
            </Grid>
            <Grid container spacing={3} style={{ padding: '12px' }}>
            <Grid item xs={6}>
                <DBCard title = "Recent Payments" component={
                    <ResourceContextProvider value="payments">
                        <List title=" " disableSyncWithLocation sort={{field:'date',order:'DESC'}} exporter={false} actions={false} perPage={6} pagination={false}>
                            <DataTable bulkActionButtons={false} >
                                <DataTable.Col source={"curriculum_id"} field={CurriculumsReferenceField} />
                                <DataTable.Col source={"client_id"} field={ClientsReferenceField} />
                                <DataTable.Col source="date" field={DataTable} />
                                <DataTable.Col label="Amount" render={record => formatCurrency(record.amount)} />
                            </DataTable>
                        </List>
                    </ResourceContextProvider>} footer={
                    <Button
                        sx={{ borderRadius: 0 , padding:2}}
                        component={Link}
                        to={{
                            pathname: '/payments',
                            search: `sort=date&order=ASC`,
                        }}
                        size="small"
                        color="primary"
                    >
                        See all payments
                    </Button>}color={"blue"}/>
            </Grid>
                <Grid item xs={6}>
                    <DBCard title = "Pending Payments" component={
                        <ResourceContextProvider value="invoices">
                            <List title=" " disableSyncWithLocation filter={{status:'unpaid'}} sort={{field:'date',order:'DESC'}} exporter={false} actions={false} perPage={6} pagination={false}>
                                <DataTable bulkActionButtons={false}>
                                    <DataTable.Col source={"curriculum_id"} field={CurriculumsReferenceField} />
                                    <DataTable.Col source={"client_id"} field={ClientsReferenceField} />
                                    <DateField source="date" />
                                    <FunctionField label="Amount" render={record => formatCurrency(record.amount)} />
                                </DataTable>
                            </List>
                        </ResourceContextProvider>}
                            footer={
                                <Button
                                    sx={{ borderRadius: 0, padding:2 }}
                                    component={Link}
                                    to={{
                                        pathname: '/invoices',
                                        search: `sort=date&order=ASC`,
                                    }}
                                    size="small"
                                    color="primary"
                                >
                                    See all pending payments
                                </Button>}
                            color={"orange"}/>
                </Grid>
            </Grid>
        </Box>
    )
};
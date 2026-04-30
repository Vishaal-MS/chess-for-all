import {formatMonth, parseMonthYear} from "./../utils";

export const aggregatePayments = (payments) => {
    const monthlyData = {};

    // Iterate over the payments and aggregate by month and curriculum_id
    payments.forEach((payment) => {
        const {date, curriculum_id, client_id, amount} = payment;
        const monthYear = formatMonth(date);
        const classKey = `class${curriculum_id}`;
        const clientKey= `client${client_id}`;

        console.log('Class Key',classKey);
        console.log('Client Key',clientKey);

        // Initialize the month entry if it doesn't exist
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = {};
        }

        // Accumulate the payment amount for the class in the specific month
        if (!monthlyData[monthYear][classKey]) {
            monthlyData[monthYear][classKey] = 0;
        }

        // Accumulate the payment amount for the client in the specific month
        if (!monthlyData[monthYear][clientKey]) {
            monthlyData[monthYear][clientKey] = 0;
        }

        monthlyData[monthYear][classKey] += parseInt(amount, 10);
        monthlyData[monthYear][clientKey] += parseInt(amount, 10);

        console.log('Monthly Data',monthlyData);
    });

    // Transform the data into the desired output format
    const result = Object.keys(monthlyData).map((month) => {
        const entry = {month};
        const classData = monthlyData[month];

        // Assuming classes can be dynamically generated, get the highest curriculum_id
        const maxClassId = Math.max(...Object.keys(classData).map((key) => parseInt(key.replace('class', ''), 10)));
        console.log('max class id',maxClassId);

        // Include all class values (class1, class2, etc.)
        for (let i = 1; i <= maxClassId; i++) {
            const classKey = `class${i}`;
            entry[classKey] = classData[classKey] || 0; // Use 0 if no data for the class
            console.log('Entry',entry);
        }

        // Assuming clients can be dynamically generated, get the highest client_id
        const maxClientId = Math.max(...Object.keys(classData).map((key) => parseInt(key.replace('client', ''), 10)));

        // Include all class values (class1, class2, etc.)
        for (let i = 1; i <= maxClientId; i++) {
            const clientKey = `client{i}`;
            entry[clientKey] = classData[clientKey] || 0; // Use 0 if no data for the class
        }
        console.log('Entry',entry);
        return entry;
    });

    // Sort the result by month and year (latest to earliest)
    result.sort((a, b) => {
        const dateA = parseMonthYear(a.month);
        const dateB = parseMonthYear(b.month);

        // Sort in descending order
        return dateB - dateA;
    });
    return result;
}

// Function to group and aggregate payments by month
export const groupByMonth = (payments) => {
    const grouped = {};

    payments.forEach(payment => {
        const date = new Date(payment.date);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' }); // 'Aug 2024'
        const amount = parseInt(payment.amount, 10);

        if (!grouped[monthYear]) {
            grouped[monthYear] = 0;
        }
        grouped[monthYear] += amount;
    });

    // Convert the grouped object to an array of objects in the desired format
    const result = Object.entries(grouped).map(([month, payments]) => ({
        month,
        payments
    }));

    // Sort the result based on the month (ascending order)
    result.sort((a, b) => new Date(a.month) - new Date(b.month));

    return result;
};

// Function to group and aggregate payments by client
export const groupByClient = (payments) => {
    const grouped = {};

    payments.forEach(payment => {
        const client_id = payment.client_id;
        const amount = parseInt(payment.amount, 10);

        if (!grouped[client_id]) {
            grouped[client_id] = 0;
        }
        grouped[client_id] += amount;
    });

    // Convert the grouped object to an array of objects in the desired format
    const result = Object.entries(grouped).map(([id, revenue]) => ({
        id,
        revenue
    }));

    // Sort the result based on the month (ascending order)
    result.sort((a, b) => b.revenue - a.revenue);
    console.log('Grouped by Client',result);
    //Return only the top 3 results
    return result.slice(0,2);
    //return result;
};

// Function to group and aggregate payments by client
export const groupByCoach = (payments) => {
    const grouped = {};

    payments.forEach(payment => {
        const coach_id = payment.coach_id;
        const amount = parseInt(payment.amount, 10);

        if (!grouped[coach_id]) {
            grouped[coach_id] = 0;
        }
        grouped[coach_id] += amount;
    });

    // Convert the grouped object to an array of objects in the desired format
    const result = Object.entries(grouped).map(([id, revenue]) => ({
        id,
        revenue
    }));

    // Sort the result based on the month (ascending order)
    result.sort((a, b) => b.revenue - a.revenue);
    console.log('Grouped by Coach',result);
    //Return only the top 3 results
    return result.slice(0,2);
    //return result;
};
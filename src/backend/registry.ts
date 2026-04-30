import { createRegistry } from '@mahaswami/vc-frontend';
import { sample_function } from './functions/sample_function';
import { sendMonthlyInvoices } from './functions/sendMonthlyInvoices';

export const functionRegistry = createRegistry({
    sample_function,
    sendMonthlyInvoices

});

export type AppFunctions = typeof functionRegistry;

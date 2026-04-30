import React from 'react';
import { PictureAsPdf } from '@mui/icons-material';
import type { ResourceActionDefs } from '@mahaswami/vc-frontend';

// Shared actions — available to all resources via appFunctions.sharedActions
export const appSharedActions: ResourceActionDefs = {
    export_pdf: {
        icon: <PictureAsPdf />,
        handler: ({ selectedIds, resource }) => {
            alert(`Exporting ${selectedIds?.length ?? 0} ${resource} record(s) as PDF`);
        },
    },
    send_monthly_invoices: {
        handler: async ({ dataProvider }) => {
            const result = await (dataProvider as any).callFunction('sendMonthlyInvoices', {});
            alert(`Created ${result.created} invoice(s), skipped ${result.skipped}`);
        },
    },
    //listActions={['send_monthly_invoices']}
};

// --- Per-resource action example ---
// Copy this block into your resource view file and customize:
//
// import { PlayArrow } from '@mui/icons-material';
// import type { ResourceActionDefs } from '@mahaswami/vc-frontend';
//
// const myResourceActionDefs: ResourceActionDefs = {
//     my_action: {
//         icon: <PlayArrow />,
//         handler: ({ selectedIds, record, dataProvider }) => {
//             alert(`Running my_action on ${selectedIds?.length ?? 1} record(s)`);
//         },
//     },
//     // Call a backend function (see src/backend/functions/sample_function.ts)
//     run_sample: {
//         handler: async ({ selectedIds, dataProvider }) => {
//             const result = await dataProvider.callFunction('sample_function', {
//                 record_ids: selectedIds ?? [],
//             });
//             alert(`Processed ${result.processed} record(s)`);
//         },
//     },
// };
//
// Then wire into your <Resource> component:
//     actionDefs={myResourceActionDefs}
//     listActions={['my_action', 'run_sample', 'export_pdf']}
//     listRowActions={['my_action']}
//     detailActions={['my_action', 'run_sample']}

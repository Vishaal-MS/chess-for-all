import { defineFunction } from '@mahaswami/vc-frontend';

export const sample_function = defineFunction({
    args: {
        record_ids: { type: 'array', required: true },
    },
    returns: {} as { processed: number },
    fn: async (_ctx, { record_ids }) => {
        console.log('[sample_function] processing', record_ids);
        return { processed: (record_ids as unknown[]).length };
    },
});

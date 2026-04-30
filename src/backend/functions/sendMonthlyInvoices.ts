import { defineFunction } from '@mahaswami/vc-frontend';

const buildEmailBody = (customerName: string, dueDate: string, amount: any) => `
<p>Dear ${customerName},</p>
<p>Please find your invoice attached.</p>
<p>
  Due date: ${dueDate}<br/>
  Amount: ${amount}
</p>
<p>Thank you.</p>
`.trim();

const fetchPdfBlob = async (src: string, maxRetries = 5): Promise<Blob | null> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const res = await fetch(src);
        if (res.ok) return res.blob();
        await new Promise(r => setTimeout(r, 1000));
    }
    return null;
};

export const sendMonthlyInvoices = defineFunction({
    args: {},
    returns: {} as Record<string, any>,
    fn: async (ctx) => {
        const { dataProvider } = ctx;

        const { data: agreements } = await dataProvider.getList('rental_agreements', {
            filter: { status: 'active' },
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'ASC' },
            meta: { prefetch: ['customers'] },
        });

        const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const sender = (window as any).appConfigOptions?.title || '';

        let created = 0;
        let emailed = 0;
        let skipped = 0;

        for (const agreement of agreements) {
            try {
                const { data: invoice } = await dataProvider.create('invoices', {
                    data: { rental_agreement_id: agreement.id },
                });
                created++;

                const customerEmail = agreement.customer?.primary_contact_email;
                if (!customerEmail) continue;

                const { data: docs } = await dataProvider.getList(
                    'template_documents_extended_attributes', {
                    filter: { name_of_resource: 'invoices', id_of_resource: invoice.id },
                });

                const pdfAttachment = docs[0]?.document_attachments?.find(
                    (a: any) => a.title?.endsWith('.pdf')
                );
                if (!pdfAttachment?.src) continue;

                const pdfBlob = pdfAttachment.rawFile instanceof Blob
                    ? pdfAttachment.rawFile
                    : await fetchPdfBlob(pdfAttachment.src);

                if (!pdfBlob || pdfBlob.size < 100) { skipped++; continue; }

                const invoiceLabel = invoice.invoice_no || `invoice_${invoice.id}`;
                const customerName = agreement.customer?.primary_contact_name || 'Customer';

                await dataProvider.sendEmail({
                    from: sender,
                    to: customerEmail,
                    subject: `Invoice ${invoice.invoice_no || invoice.id}`,
                    message: buildEmailBody(customerName, dueDate, agreement.rent_amount),
                    attachments: [{ file: pdfBlob, filename: `${invoiceLabel}.pdf` }],
                });
                emailed++;
            } catch (e: any) {
                console.error(`[sendMonthlyInvoices] Failed for agreement ${agreement.id}: ${e.message}`);
                skipped++;
            }
        }

        return { created, emailed, skipped };
    },
});

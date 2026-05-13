export const printReceipt = (saleData) => {
    const {
        invoiceNumber,
        items,
        subtotal,
        tax,
        total,
        customerName,
        cashierName,
        paymentMethod
    } = saleData;

    const formatMoney = (amount) => {
        const num = Number(amount) || 0;
        return 'PHP ' + num.toLocaleString('en-PH', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    };

    const formatNumber = (num) => {
        return Number(num || 0).toLocaleString('en-PH');
    };

    const center = (text) => {
        const width = 32;
        const padding = Math.max(0, (width - text.length) / 2);
        return ' '.repeat(Math.floor(padding)) + text;
    };

    let receipt = '';
    
    
    receipt += '================================\n';
    receipt += center('POS SYSTEM') + '\n';
    receipt += center('123 Business Street') + '\n';
    receipt += center('Tel: (123) 456-7890') + '\n';
    receipt += center('VAT REG: 12-345-6789') + '\n';
    receipt += '================================\n';
    receipt += `INVOICE: ${invoiceNumber}\n`;
    receipt += `DATE: ${new Date().toLocaleString()}\n`;
    receipt += `CASHIER: ${cashierName || 'Cashier'}\n`;
    receipt += `CUSTOMER: ${customerName || 'Walk-in'}\n`;
    receipt += `PAYMENT: ${paymentMethod || 'Cash'}\n`;
    receipt += '--------------------------------\n';
    receipt += 'ITEM               QTY     TOTAL\n';
    receipt += '--------------------------------\n';
    
    // Items - use consistent price field
    items.forEach(item => {
        // Get price - handle both 'sellingPrice' and 'unitPrice' and 'price'
        const price = item.unitPrice || item.sellingPrice || item.price || 0;
        const itemName = item.name || 'Unknown Item';
        const quantity = item.quantity || 1;
        const itemTotal = price * quantity;
        
        let name = itemName.substring(0, 20).padEnd(20);
        let qty = formatNumber(quantity).padStart(3);
        let totalStr = formatMoney(itemTotal).padStart(12);
        receipt += `${name} ${qty} ${totalStr}\n`;
    });
    
    receipt += '--------------------------------\n';
    
    
    receipt += `SUBTOTAL:${' '.repeat(18)}${formatMoney(subtotal)}\n`;
    receipt += `VAT (12%):${' '.repeat(18)}${formatMoney(tax)}\n`;
    receipt += '================================\n';
    receipt += `TOTAL:${' '.repeat(21)}${formatMoney(total)}\n`;
    receipt += '================================\n';
    receipt += center('THANK YOU FOR SHOPPING!') + '\n';
    receipt += center('Returns accepted within 7 days') + '\n';
    receipt += center('Keep this receipt for warranty') + '\n';
    receipt += '================================\n';
    receipt += center('*** END OF RECEIPT ***') + '\n';
    receipt += '\n\n';

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    
    if (!printWindow) {
        alert('Please allow pop-ups for this site');
        return;
    }
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${invoiceNumber}</title>
            <style>
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    margin: 0;
                    padding: 5mm;
                }
                @media print {
                    @page {
                        size: 58mm auto;
                        margin: 0mm;
                    }
                    body {
                        margin: 0;
                        padding: 2mm;
                    }
                }
                pre {
                    margin: 0;
                    padding: 0;
                    white-space: pre-wrap;
                }
            </style>
        </head>
        <body>
            <pre>${receipt}</pre>
            <script>
                setTimeout(function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                }, 500);
            <\/script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
};

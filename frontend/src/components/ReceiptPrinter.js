export const printReceipt = (saleData) => {
    const {
        invoiceNumber = 'INV-1778718016088',
        items = [],
        subtotal = 206.00,
        tax = 24.72,
        total = 230.72,
        customerName = 'Walk-in Customer',
        cashierName = 'akisato',
        cashAmount = 300.00,
        change = 69.28,
        baggerName = 'AKISATO',
        terminalId = 'POS_PAR12'
    } = saleData;

    const now = new Date();

    const formatDate = (date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const formatDateTime = (date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedHours = String(hours).padStart(2, '0');
        return `${month}/${day}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
    };

    const getIssueDate = () => {
        const issueDate = new Date(now);
        issueDate.setMonth(issueDate.getMonth() - 1);
        return formatDate(issueDate);
    };

    const getExpirationDate = () => {
        const expDate = new Date(now);
        expDate.setMonth(expDate.getMonth() + 1);
        return formatDate(expDate);
    };

    const formatMoney = (amount) => {
        const num = Number(amount) || 0;
        return '₱' + num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatNumber = (num) => Number(num || 0).toLocaleString('en-PH');

    const center = (text, width = 44) => {
        const padding = Math.max(0, (width - text.length) / 2);
        return ' '.repeat(Math.floor(padding)) + text;
    };

    const line = (char = '=', width = 44) => char.repeat(width);
    const thinLine = (char = '-', width = 44) => char.repeat(width);

    const padLeft = (text, width) => {
        const str = String(text);
        if (str.length >= width) return str.substring(0, width);
        return ' '.repeat(width - str.length) + str;
    };

    const padRight = (text, width) => {
        const str = String(text);
        if (str.length >= width) return str.substring(0, width);
        return str + ' '.repeat(width - str.length);
    };

    let receipt = '\n';

    // Header
    receipt += center('FRINCE WAREHOUSE INC') + '\n';
    receipt += center('Cebu City') + '\n';
    receipt += center('VAT REG TIN: 001-588-219-003') + '\n';
    receipt += center('SN: Z2APETRG MIN: 120277459') + '\n';
    receipt += line() + '\n';
    receipt += center('SALES INVOICE') + '\n';
    receipt += line() + '\n';

    // Transaction info
    receipt += `Terminal: ${terminalId}\n`;
    receipt += `Trans #: ${invoiceNumber}\n`;
    receipt += `SI #: ${invoiceNumber}\n`;
    receipt += `Cashier: ${cashierName}\n`;
    receipt += `Bagger: ${baggerName}\n`;
    receipt += `Customer: ${customerName}\n`;
    receipt += `TIN: ---\n`;
    receipt += `Address: ---\n`;
    receipt += `Bus. Style: ---\n`;
    receipt += thinLine() + '\n';

    // Column headers (fits in 44 chars: 24+4+7+7=42)
    receipt += padRight('ITEM', 24) + padRight('QTY', 4) + padRight('PRICE', 7) + padRight('TOTAL', 7) + '\n';
    receipt += thinLine() + '\n';

    // Items
    let totalItems = 0;
    items.forEach(item => {
        const name = (item.name || 'Unknown Item').substring(0, 24);
        const quantity = item.quantity || 1;
        const price = item.unitPrice || item.sellingPrice || item.price || 0;
        const itemTotal = price * quantity;
        totalItems += quantity;

        receipt += padRight(name, 24);
        receipt += padLeft(formatNumber(quantity), 4);
        receipt += padLeft(formatMoney(price), 7);
        receipt += padLeft(formatMoney(itemTotal), 7) + '\n';
    });

    receipt += thinLine() + '\n';
    receipt += center(`${formatNumber(totalItems)} Item(s)`) + '\n';
    receipt += line() + '\n';

    // Payment (30 + 14 = 44)
    receipt += padRight('AMOUNT DUE:', 30) + padLeft(formatMoney(total), 14) + '\n';
    receipt += padRight('Cash:', 30) + padLeft(formatMoney(cashAmount), 14) + '\n';
    receipt += padRight('CHANGE:', 30) + padLeft(formatMoney(change), 14) + '\n';
    receipt += thinLine() + '\n';

    // VAT
    receipt += padRight('VATABLE SALES:', 30) + padLeft(formatMoney(subtotal), 14) + '\n';
    receipt += padRight('VAT AMOUNT:', 30) + padLeft(formatMoney(tax), 14) + '\n';
    receipt += line() + '\n';
    receipt += padRight('Total Amount:', 30) + padLeft(formatMoney(total), 14) + '\n';
    receipt += line() + '\n';

    // Footer
    receipt += center('POS Supplier: IRIPPLE, INC.') + '\n';
    receipt += center('2305B EAST TOWER PSE CENTER') + '\n';
    receipt += center('EXCHANGE ROAD ORTIGAS CENTER') + '\n';
    receipt += center('SAN ANTONIO PASIG CITY 1605') + '\n';
    receipt += center('TIN: 008738621-00000') + '\n';
    receipt += center(`Date Issued: ${getIssueDate()}`) + '\n';
    receipt += center(`Valid Until: ${getExpirationDate()}`) + '\n';
    receipt += line() + '\n';
    receipt += center('Thank you for shopping with us!') + '\n';
    receipt += center('THIS SERVES AS YOUR SALES INVOICE') + '\n';
    receipt += center(`Printed: ${formatDateTime(now)}`) + '\n';
    receipt += center('*** END OF RECEIPT ***') + '\n';
    receipt += '\n\n';

    // Print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Sales Invoice - ${invoiceNumber}</title>
            <meta charset="UTF-8">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Courier New', 'Courier', monospace;
                    font-size: 9px;
                    font-weight: bold;
                    width: 58mm;
                    margin: 0;
                    padding: 1.5mm;
                    background: white;
                }
                @media print {
                    @page {
                        size: 58mm auto;
                        margin: 0mm;
                    }
                    body {
                        margin: 0;
                        padding: 1.5mm;
                    }
                }
                pre {
                    margin: 0;
                    padding: 0;
                    white-space: pre;
                    font-family: 'Courier New', 'Courier', monospace;
                    font-size: 9px;
                    font-weight: bold;
                    line-height: 1.25;
                }
            </style>
        </head>
        <body>
            <pre>${receipt}</pre>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                };
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
};

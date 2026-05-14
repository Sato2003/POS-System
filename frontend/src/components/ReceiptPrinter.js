export const printReceipt = (saleData) => {
    const {
        invoiceNumber = 'INV-1778717599867',
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

    const center = (text, width = 48) => {
        const padding = Math.max(0, (width - text.length) / 2);
        return ' '.repeat(Math.floor(padding)) + text;
    };

    const line = (char = '=', width = 48) => char.repeat(width);
    const thinLine = (char = '-', width = 48) => char.repeat(width);

    const padText = (text, width, align = 'left') => {
        const str = String(text);
        if (str.length >= width) return str.substring(0, width);
        if (align === 'right') return ' '.repeat(width - str.length) + str;
        return str + ' '.repeat(width - str.length);
    };

    let receipt = '\n';

    receipt += center('FRINCE WAREHOUSE INC') + '\n';
    receipt += center('Cebu City') + '\n';
    receipt += center('VAT REG TIN: 001-588-219-003') + '\n';
    receipt += center('SN: Z2APETRG MIN: 120277459') + '\n';
    receipt += line() + '\n';
    receipt += center('SALES INVOICE') + '\n';
    receipt += line() + '\n';

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

    receipt += padText('ITEM', 28) + padText('QTY', 5) + padText('PRICE', 7) + padText('TOTAL', 8) + '\n';
    receipt += thinLine() + '\n';

    let totalItems = 0;
    items.forEach(item => {
        const name = (item.name || 'Unknown Item').substring(0, 28);
        const quantity = item.quantity || 1;
        const price = item.unitPrice || item.sellingPrice || item.price || 0;
        const itemTotal = price * quantity;
        totalItems += quantity;

        receipt += padText(name, 28);
        receipt += padText(formatNumber(quantity), 5);
        receipt += padText(formatMoney(price), 7);
        receipt += padText(formatMoney(itemTotal), 8) + '\n';
    });

    receipt += thinLine() + '\n';
    receipt += center(`${formatNumber(totalItems)} Item(s)`) + '\n';
    receipt += line() + '\n';

    receipt += padText('AMOUNT DUE:', 35) + padText(formatMoney(total), 13, 'right') + '\n';
    receipt += padText('Cash:', 35) + padText(formatMoney(cashAmount), 13, 'right') + '\n';
    receipt += padText('CHANGE:', 35) + padText(formatMoney(change), 13, 'right') + '\n';
    receipt += thinLine() + '\n';

    receipt += padText('VATABLE SALES:', 35) + padText(formatMoney(subtotal), 13, 'right') + '\n';
    receipt += padText('VAT AMOUNT:', 35) + padText(formatMoney(tax), 13, 'right') + '\n';
    receipt += line() + '\n';
    receipt += padText('Total Amount:', 35) + padText(formatMoney(total), 13, 'right') + '\n';
    receipt += line() + '\n';

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

    // Brave-compatible print method
    const printContent = `
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
            padding: 2mm;
            background: white;
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
            pre {
                margin: 0;
                padding: 0;
                white-space: pre;
                font-family: 'Courier New', 'Courier', monospace;
                font-size: 9px;
                font-weight: bold;
                line-height: 1.2;
            }
        }
        pre {
            margin: 0;
            padding: 0;
            white-space: pre;
            font-family: 'Courier New', 'Courier', monospace;
            font-size: 9px;
            font-weight: bold;
            line-height: 1.2;
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
            }, 500);
        };
    <\/script>
</body>
</html>`;

    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank', 'width=400,height=600');
    
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
};

export const printReceipt = (saleData) => {
    const {
        invoiceNumber,
        items,
        subtotal,
        tax,
        total,
        customerName,
        cashierName,
        cashAmount = 0,
        change = 0,
        baggerName = 'AKISATO',
        terminalId = 'POS_PARI2'
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
        return '₱ ' + num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatNumber = (num) => Number(num || 0).toLocaleString('en-PH');

    const center = (text, width = 48) => {
        const padding = Math.max(0, (width - text.length) / 2);
        return ' '.repeat(Math.floor(padding)) + text;
    };

    const line = (width = 48) => '='.repeat(width);
    const thinLine = (width = 48) => '-'.repeat(width);

    function padText(text, width) {
        const str = String(text);
        if (str.length >= width) return str.substring(0, width);
        return str + ' '.repeat(width - str.length);
    }

    const businessName = "FRINCE WAREHOUSE INC";
    const address = "Cebu City";
    const vatTin = "VAT REG TIN: 001-588-219-003";
    const serialNo = "SN: Z2APETRG MIN: 120277459";

    let receipt = '';

    receipt += '\n' + center(businessName) + '\n';
    receipt += center(address) + '\n';
    receipt += center(vatTin) + '\n';
    receipt += center(serialNo) + '\n';
    receipt += line() + '\n';
    receipt += center('SALES INVOICE') + '\n';
    receipt += line() + '\n';

    receipt += `Terminal: ${terminalId}\n`;
    receipt += `Trans #: ${invoiceNumber}\n`;
    receipt += `SI #: ${invoiceNumber}\n`;
    receipt += `Cashier: ${cashierName || 'Cashier'}\n`;
    receipt += `Bagger: ${baggerName}\n`;
    receipt += `Customer: ${customerName || 'Walk-in Customer'}\n`;
    receipt += `TIN: ---\n`;
    receipt += `Address: ---\n`;
    receipt += `Bus. Style: ---\n`;
    receipt += thinLine() + '\n';

    receipt += padText('ITEM', 28) + padText('QTY', 5) + padText('PRICE', 8) + padText('TOTAL', 8) + '\n';
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
        receipt += padText(formatMoney(price), 8);
        receipt += padText(formatMoney(itemTotal), 8) + '\n';
    });

    receipt += thinLine() + '\n';
    receipt += padText(`${formatNumber(totalItems)} Item(s)`, 49) + '\n';
    receipt += line() + '\n';

    receipt += padText(`AMOUNT DUE:`, 35) + padText(formatMoney(total), 13) + '\n';
    receipt += padText(`Cash:`, 35) + padText(formatMoney(cashAmount || total), 13) + '\n';
    receipt += padText(`CHANGE:`, 35) + padText(formatMoney(change), 13) + '\n';
    receipt += thinLine() + '\n';

    const vatableSales = subtotal;
    const vatAmount = tax;

    receipt += padText(`VATABLE SALES:`, 35) + padText(formatMoney(vatableSales), 13) + '\n';
    receipt += padText(`VAT AMOUNT:`, 35) + padText(formatMoney(vatAmount), 13) + '\n';
    receipt += line() + '\n';
    receipt += padText(`Total Amount:`, 35) + padText(formatMoney(total), 13) + '\n';
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

    // OPTIMIZED FOR PRTEC 58mm - Sharp and clear
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = 'none';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Sales Invoice - ${invoiceNumber}</title>
            <style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    body {
        font-family: 'Courier New', 'Courier', monospace;
        font-size: 9.5px;
        font-weight: bold;
        width: 58mm;
        margin: 0;
        padding: 1.5mm;
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
        white-space: pre-wrap;
        font-family: 'Courier New', 'Courier', monospace;
        font-size: 9.5px;
        font-weight: bold;
        line-height: 1.3;
        letter-spacing: 0.2px;
    }
</style>
        </head>
        <body>
            <pre>${receipt}</pre>
            <script>
                window.print();
                setTimeout(function() {
                    window.parent.document.body.removeChild(window.frameElement);
                }, 1000);
            <\/script>
        </body>
        </html>
    `);
    frameDoc.close();
};

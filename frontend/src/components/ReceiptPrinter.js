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

    // // Get current date and time
    // const now = new Date();
    
    // // Format: MM/DD/YYYY
    // const formatDate = (date) => {
    //     const month = String(date.getMonth() + 1).padStart(2, '0');
    //     const day = String(date.getDate()).padStart(2, '0');
    //     const year = date.getFullYear();
    //     return `${month}/${day}/${year}`;
    // };
    
    // // Format: MM/DD/YYYY HH:MM:SS AM/PM
    // const formatDateTime = (date) => {
    //     const month = String(date.getMonth() + 1).padStart(2, '0');
    //     const day = String(date.getDate()).padStart(2, '0');
    //     const year = date.getFullYear();
    //     let hours = date.getHours();
    //     const minutes = String(date.getMinutes()).padStart(2, '0');
    //     const seconds = String(date.getSeconds()).padStart(2, '0');
    //     const ampm = hours >= 12 ? 'PM' : 'AM';
    //     hours = hours % 12;
    //     hours = hours ? hours : 12;
    //     const formattedHours = String(hours).padStart(2, '0');
    //     return `${month}/${day}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
    // };
    
    // // Calculate expiration date (e.g., +2 years from now)
    // const getExpirationDate = () => {
    //     const expDate = new Date(now);
    //     expDate.setFullYear(expDate.getFullYear() + 2); // Valid for 2 years
    //     return formatDate(expDate);
    // };
    
    // // Calculate issue date (e.g., -1 year from now for demonstration)
    // const getIssueDate = () => {
    //     const issueDate = new Date(now);
    //     issueDate.setFullYear(issueDate.getFullYear() - 1);
    //     return formatDate(issueDate);
    // };

    // Get current date and time
const now = new Date();

// Format: MM/DD/YYYY
const formatDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

// Format: MM/DD/YYYY HH:MM:SS AM/PM
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

// Calculate issue date (e.g., 1 month ago)
const getIssueDate = () => {
    const issueDate = new Date(now);
    issueDate.setMonth(issueDate.getMonth() - 1); // 1 month ago
    return formatDate(issueDate);
};

// Calculate expiration date (1 month from now)
const getExpirationDate = () => {
    const expDate = new Date(now);
    expDate.setMonth(expDate.getMonth() + 1); // 1 month from now
    return formatDate(expDate);
};

    const formatMoney = (amount) => {
        const num = Number(amount) || 0;
        return '₱ ' + num.toLocaleString('en-PH', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    };

    const formatNumber = (num) => {
        return Number(num || 0).toLocaleString('en-PH');
    };

    // For 58mm printer - max 48 characters per line
    const center = (text, width = 48) => {
        const padding = Math.max(0, (width - text.length) / 2);
        return ' '.repeat(Math.floor(padding)) + text;
    };

    const line = (width = 48) => {
        return '='.repeat(width);
    };

    const thinLine = (width = 48) => {
        return '-'.repeat(width);
    };

    function padText(text, width) {
        const str = String(text);
        if (str.length >= width) return str.substring(0, width);
        return str + ' '.repeat(width - str.length);
    }

    // Business Information
    const businessName = "FRINCE WAREHOUSE INC";
    const address = "Cebu City";
    const vatTin = "VAT REG TIN: 001-588-219-003";
    const serialNo = "SN: Z2APETRG MIN: 120277459";

    let receipt = '';

    // Header Section
    receipt += '\n';
    receipt += center(businessName) + '\n';
    receipt += center(address) + '\n';
    receipt += center(vatTin) + '\n';
    receipt += center(serialNo) + '\n';
    receipt += line() + '\n';
    receipt += center('SALES INVOICE') + '\n';
    receipt += line() + '\n';

    // Transaction Details with actual date/time
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

    // Items Header
    receipt += padText('ITEM', 28) + padText('QTY', 5) + padText('PRICE', 8) + padText('TOTAL', 8) + '\n';
    receipt += thinLine() + '\n';

    // Items
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

    // Payment Summary
    receipt += padText(`AMOUNT DUE:`, 35) + padText(formatMoney(total), 13) + '\n';
    receipt += padText(`Cash:`, 35) + padText(formatMoney(cashAmount || total), 13) + '\n';
    receipt += padText(`CHANGE:`, 35) + padText(formatMoney(change), 13) + '\n';
    receipt += thinLine() + '\n';

    // VAT Breakdown
    const vatableSales = subtotal;
    const vatExemptSales = 0;
    const zeroRatedSales = 0;
    const vatAmount = tax;

    receipt += padText(`VATABLE SALES:`, 35) + padText(formatMoney(vatableSales), 13) + '\n';
    receipt += padText(`VAT-EXEMPT SALES:`, 35) + padText(formatMoney(vatExemptSales), 13) + '\n';
    receipt += padText(`ZERO-RATED SALES:`, 35) + padText(formatMoney(zeroRatedSales), 13) + '\n';
    receipt += thinLine() + '\n';
    receipt += padText(`Total Sales:`, 35) + padText(formatMoney(vatableSales), 13) + '\n';
    receipt += padText(`VAT AMOUNT:`, 35) + padText(formatMoney(vatAmount), 13) + '\n';
    receipt += line() + '\n';
    receipt += padText(`Total Amount:`, 35) + padText(formatMoney(total), 13) + '\n';
    receipt += padText(`Grocery:`, 35) + padText(formatMoney(total), 13) + '\n';
    receipt += padText(`Non Grocery:`, 35) + padText(formatMoney(0), 13) + '\n';
    receipt += line() + '\n';

    // POS Supplier Information with dynamic dates
    receipt += center('POS Supplier: IRIPPLE, INC.') + '\n';
    receipt += center('2305B EAST TOWER PSE CENTER') + '\n';
    receipt += center('EXCHANGE ROAD ORTIGAS CENTER') + '\n';
    receipt += center('SAN ANTONIO PASIG CITY 1605') + '\n';
    receipt += center('TIN: 008738621-00000') + '\n';
    receipt += center('Accred No.: 43A009386212015030265') + '\n';
    receipt += center(`Date Issued: ${getIssueDate()}`) + '\n';      // Dynamic issue date
    receipt += center(`Valid Until: ${getExpirationDate()}`) + '\n'; // Dynamic expiration date
    receipt += center('PTU: 0512-082-125811-003') + '\n';
    receipt += line() + '\n';

    // Footer with actual print time
    receipt += center('Thank you for shopping with us!') + '\n';
    receipt += center('THIS SERVES AS YOUR SALES INVOICE') + '\n';
    receipt += center(`Printed: ${formatDateTime(now)}`) + '\n';      // Actual print time
    receipt += center('*** END OF RECEIPT ***') + '\n';
    receipt += '\n\n';

    // Auto print with no pop-up - PRTEC 58mm compatible
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
                    font-family: 'Courier New', monospace;
                    font-size: 10px;
                    width: 58mm;
                    margin: 0;
                    padding: 2mm;
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
                    font-family: 'Courier New', monospace;
                    font-size: 10px;
                    line-height: 1.25;
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

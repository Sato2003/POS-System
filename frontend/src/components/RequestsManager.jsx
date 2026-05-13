export const printReceipt = (saleData) => {
    const {
        invoiceNumber,
        items,
        subtotal,
        tax,
        total,
        customerName,
        cashierName,
        change = 0,
        cashAmount = 0,
        baggerName = 'NINO BACALSO',
        terminalId = 'POS PAR12',
        transNumber = invoiceNumber,
        siNumber = invoiceNumber
    } = saleData;

    const formatMoney = (amount) => {
        const num = Number(amount) || 0;
        return 'P ' + num.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatNumber = (num) => {
        return Number(num || 0).toLocaleString('en-PH');
    };

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
    const businessName = "FRINCE WAREHOUSE CLUB MANDAUE";
    const address = "Hi-way, Bulacao, Cebu City";
    const vatTin = "VAT REG TIN: 001-588-219-005";
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

    // Transaction Details
    receipt += `Terminal: ${terminalId}\n`;
    receipt += `Trans #: ${transNumber}\n`;
    receipt += `SI #: ${siNumber}\n`;
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

    // POS Supplier Information
    receipt += center('POS Supplier: IRIPPLE, INC.') + '\n';
    receipt += center('2305B EAST TOWER PSE CENTER') + '\n';
    receipt += center('EXCHANGE ROAD ORTIGAS CENTER') + '\n';
    receipt += center('SAN ANTONIO PASIG CITY 1605') + '\n';
    receipt += center('TIN: 008738621-00000') + '\n';
    receipt += center('Accred No.: 43A009386212015030265') + '\n';
    receipt += center('Valid Until: 07/31/2025') + '\n';
    receipt += center('PTU: 0512-082-125811-003') + '\n';
    receipt += center('Date Issued: 08/01/2020') + '\n';
    receipt += line() + '\n';

    // Footer
    receipt += center('Thank you for shopping with us!') + '\n';
    receipt += center('THIS SERVES AS YOUR SALES INVOICE') + '\n';
    receipt += center('*** END OF RECEIPT ***') + '\n';
    receipt += '\n\n';

    // AUTO PRINT - No pop-up window
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
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                    margin: 0;
                    padding: 5mm;
                    width: 80mm;
                }
                @media print {
                    @page {
                        size: 80mm auto;
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
                    font-size: 11px;
                }
            </style>
        </head>
        <body>
            <pre>${receipt}</pre>
            <script>
                // Auto print immediately
                window.print();
                // Close the frame after printing
                setTimeout(function() {
                    window.parent.document.body.removeChild(window.frameElement);
                }, 1000);
            <\/script>
        </body>
        </html>
    `);
    frameDoc.close();
};

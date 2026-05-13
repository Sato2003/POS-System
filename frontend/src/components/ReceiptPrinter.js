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
        baggerName = 'AKISATO',
        terminalId = 'POS_PARI2',
    } = saleData;

    const formatMoney = (amount) => {
        const num = Number(amount) || 0;
        return 'P ' + num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatNumber = (num) => Number(num || 0).toLocaleString('en-PH');
    
    const center = (text, width = 48) => ' '.repeat(Math.max(0, Math.floor((width - text.length) / 2))) + text;
    const line = (width = 48) => '='.repeat(width);
    const thinLine = (width = 48) => '-'.repeat(width);
    
    function padText(text, width) {
        const str = String(text);
        return str.length >= width ? str.substring(0, width) : str + ' '.repeat(width - str.length);
    }

    let receipt = '';

    // Header
    receipt += '\n' + center('FRINCE WAREHOUSE CLUB MANDAUE INC') + '\n';
    receipt += center('Hi-way, Bulacao, Cebu City') + '\n';
    receipt += center('VAT REG TIN: 001-588-219-003') + '\n';
    receipt += line() + '\n';
    receipt += center('SALES INVOICE') + '\n';
    receipt += line() + '\n';

    // Transaction Details
    receipt += `Terminal: ${terminalId}\n`;
    receipt += `Trans #: ${invoiceNumber}\n`;
    receipt += `SI #: ${invoiceNumber}\n`;
    receipt += `Cashier: ${cashierName || 'Cashier'}\n`;
    receipt += `Bagger: ${baggerName}\n`;
    receipt += `Customer: ${customerName || 'Walk-in Customer'}\n`;
    receipt += thinLine() + '\n';

    // Items
    receipt += padText('ITEM', 28) + padText('QTY', 5) + padText('PRICE', 8) + padText('TOTAL', 8) + '\n';
    receipt += thinLine() + '\n';

    let totalItems = 0;
    items.forEach(item => {
        const name = (item.name || 'Unknown Item').substring(0, 28);
        const qty = item.quantity || 1;
        const price = item.unitPrice || item.sellingPrice || 0;
        const itemTotal = price * qty;
        totalItems += qty;

        receipt += padText(name, 28);
        receipt += padText(formatNumber(qty), 5);
        receipt += padText(formatMoney(price), 8);
        receipt += padText(formatMoney(itemTotal), 8) + '\n';
    });

    receipt += thinLine() + '\n';
    receipt += padText(`${formatNumber(totalItems)} Item(s)`, 49) + '\n';
    receipt += line() + '\n';

    // Payment
    receipt += padText(`AMOUNT DUE:`, 35) + padText(formatMoney(total), 13) + '\n';
    receipt += padText(`Cash:`, 35) + padText(formatMoney(cashAmount || total), 13) + '\n';
    receipt += padText(`CHANGE:`, 35) + padText(formatMoney(change), 13) + '\n';
    receipt += thinLine() + '\n';

    // VAT
    receipt += padText(`VATABLE SALES:`, 35) + padText(formatMoney(subtotal), 13) + '\n';
    receipt += padText(`VAT AMOUNT:`, 35) + padText(formatMoney(tax), 13) + '\n';
    receipt += line() + '\n';
    receipt += padText(`TOTAL AMOUNT:`, 35) + padText(formatMoney(total), 13) + '\n';
    receipt += line() + '\n';

    // Footer
    receipt += center('Thank you for shopping with us!') + '\n';
    receipt += center('*** END OF RECEIPT ***') + '\n';

    // Print without pop-up
    const printDiv = document.createElement('div');
    printDiv.style.position = 'absolute';
    printDiv.style.left = '-9999px';
    printDiv.style.top = '-9999px';
    printDiv.innerHTML = `<pre style="font-family:'Courier New',monospace;font-size:11px;margin:0;padding:5mm;">${receipt}</pre>`;
    
    document.body.appendChild(printDiv);
    window.print();
    setTimeout(() => document.body.removeChild(printDiv), 1000);
};

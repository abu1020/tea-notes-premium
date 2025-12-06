import { Transaction } from '../types';

// These will be available globally from the scripts in index.html
declare var jsPDF: any;

// FIX: Add type definition for jspdf on the window object.
declare global {
  interface Window {
    jspdf: any;
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Converts an array of transactions to a CSV string and triggers a download.
 * @param transactions The data to export.
 */
export const exportToCsv = (transactions: Transaction[]) => {
  const headers = ['ID', 'Date', 'User', 'Type', 'Note', 'Quantity', 'Price (₹)', 'Amount (₹)'];
  
  const rows = transactions.map(tx => [
    tx.id,
    formatDate(tx.date),
    `"${tx.user}"`, // Escape user name
    tx.type,
    `"${tx.note.replace(/"/g, '""')}"`, // Escape quotes in note
    tx.quantity,
    tx.price.toFixed(2),
    tx.amount.toFixed(2)
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.href) {
    URL.revokeObjectURL(link.href);
  }
  link.href = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().slice(0, 10);
  link.download = `office-bu-export-${timestamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Converts an array of transactions to a PDF and triggers a download.
 * @param transactions The data to export.
 */
export const exportToPdf = (transactions: Transaction[]) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Office BU Transaction Report', 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  const tableColumn = ['ID', 'Date', 'User', 'Type', 'Note', 'Qty', 'Price', 'Amount'];
  const tableRows: any[][] = [];

  transactions.forEach(tx => {
    const transactionData = [
      tx.id,
      formatDate(tx.date),
      tx.user,
      tx.type,
      tx.note,
      tx.quantity,
      `₹${tx.price.toFixed(2)}`,
      `₹${tx.amount.toFixed(2)}`
    ];
    tableRows.push(transactionData);
  });
  
  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    theme: 'striped',
    styles: {
        font: 'helvetica',
        fontSize: 8
    },
    headStyles: {
        fillColor: [41, 128, 185], // A nice blue color
        textColor: 255,
        fontStyle: 'bold'
    }
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`office-bu-export-${timestamp}.pdf`);
};

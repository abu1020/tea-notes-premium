import { Transaction } from '../types';

declare global {
  interface Window {
    gapi: any;
  }
}

const SHEET_NAME = 'Transactions';
const SHEET_RANGE = `${SHEET_NAME}!A:H`; // Columns for id, type, amount, note, date, user, quantity, price

// Helper to handle GAPI errors
const getErrorMessage = (err: any): string => {
    return err.result?.error?.message || err.message || 'An unknown error occurred.';
};

/**
 * Fetches all transactions from the specified Google Sheet.
 * @param spreadsheetId The ID of the Google Spreadsheet.
 * @returns A promise that resolves to an array of Transaction objects.
 */
export const getTransactions = async (spreadsheetId: string): Promise<Transaction[]> => {
    try {
        const response = await window.gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: SHEET_RANGE,
        });
        const values = response.result.values || [];
        
        // Skip header row (index 0) and parse data
        const transactions: Transaction[] = values.slice(1).map((row: any[]) => ({
            id: parseInt(row[0], 10),
            type: row[1],
            amount: parseFloat(row[2]),
            note: row[3],
            date: row[4],
            user: row[5],
            quantity: parseInt(row[6], 10),
            price: parseFloat(row[7]),
        })).filter(tx => tx.id && !isNaN(tx.id)); // Filter out malformed or empty rows

        return transactions;

    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};
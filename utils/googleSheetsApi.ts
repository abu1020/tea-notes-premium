import { Transaction } from '../types';

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

/**
 * Appends a new transaction to the Google Sheet.
 * @param spreadsheetId The ID of the Google Spreadsheet.
 * @param tx The Transaction object to add.
 */
export const appendTransaction = async (spreadsheetId: string, tx: Transaction): Promise<void> => {
    try {
        const values = [[
            tx.id, tx.type, tx.amount, tx.note, tx.date,
            tx.user, tx.quantity, tx.price
        ]];

        await window.gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: SHEET_RANGE,
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });

    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};


/**
 * Deletes a transaction row from the Google Sheet based on its ID.
 * This is a more robust implementation that removes the entire row.
 * @param spreadsheetId The ID of the Google Spreadsheet.
 * @param transactionId The unique ID of the transaction to delete.
 */
export const deleteTransactionRow = async (spreadsheetId: string, transactionId: number): Promise<void> => {
    try {
        // Step 1: Find the row index of the transaction to delete.
        const idRange = `${SHEET_NAME}!A:A`;
        const response = await window.gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: idRange,
        });

        const ids = response.result.values?.flat() || [];
        const rowIndex = ids.findIndex(id => parseInt(id, 10) === transactionId);

        if (rowIndex === -1) {
            // If ID not found, it might have been deleted already. Don't throw an error.
            console.warn(`Transaction with ID ${transactionId} not found in the sheet. It might be already deleted.`);
            return;
        }

        // Step 2: Get the sheet's GID (Grid ID), which is required for row deletion.
        const sheetMetadataResponse = await window.gapi.client.sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId,
        });
        
        const sheet = sheetMetadataResponse.result.sheets?.find(
            s => s.properties?.title === SHEET_NAME
        );

        if (!sheet || sheet.properties?.sheetId === undefined) {
            throw new Error(`Could not find a sheet named "${SHEET_NAME}" in the spreadsheet.`);
        }
        const sheetId = sheet.properties.sheetId;

        // Step 3: Use batchUpdate to send a request to delete the specific row.
        const batchUpdateRequest = {
            requests: [
                {
                    deleteDimension: {
                        range: {
                            sheetId: sheetId,
                            dimension: 'ROWS',
                            startIndex: rowIndex,
                            endIndex: rowIndex + 1,
                        },
                    },
                },
            ],
        };

        await window.gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            resource: batchUpdateRequest,
        });
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

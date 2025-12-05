/**
 * This function is a webhook that handles POST requests to manage transactions.
 * It's the secure bridge between your web app and the Google Sheet.
 * @param {Object} e The event parameter for a POST request.
 * @returns {ContentService.TextOutput} A JSON response indicating success or failure.
 */
function doPost(e) {
  try {
    // Open the spreadsheet and select the 'Transactions' sheet.
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transactions');
    if (!sheet) {
      throw new Error("Sheet 'Transactions' not found. Please ensure the sheet tab is named correctly.");
    }

    // Parse the incoming JSON data from the request body.
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const transaction = postData.transaction;

    let result;

    switch (action) {
      case 'add':
        if (!transaction) throw new Error("Transaction data is missing for 'add' action.");
        // Append a new row with the transaction data in the correct order.
        sheet.appendRow([
          transaction.id,
          transaction.type,
          transaction.amount,
          transaction.note,
          transaction.date,
          transaction.user,
          transaction.quantity,
          transaction.price
        ]);
        result = { status: 'success', message: 'Transaction added successfully.', id: transaction.id };
        break;

      case 'delete':
        if (!transaction || !transaction.id) throw new Error("Transaction ID is missing for 'delete' action.");
        const dataRange = sheet.getDataRange();
        const values = dataRange.getValues();
        let rowDeleted = false;
        // Find the row index matching the transaction ID (column A, index 0).
        // We search from the end to handle duplicates safely, although IDs should be unique.
        for (var i = values.length - 1; i >= 1; i--) { // Start from 1 to skip header
          if (values[i][0] == transaction.id) {
            sheet.deleteRow(i + 1); // Sheet rows are 1-indexed.
            rowDeleted = true;
            break;
          }
        }
        if (rowDeleted) {
          result = { status: 'success', message: 'Transaction deleted successfully.', id: transaction.id };
        } else {
          // If the loop completes without finding the ID, it was already deleted. This is not an error.
          result = { status: 'success', message: 'Transaction not found, likely already deleted.', id: transaction.id };
        }
        break;
      
      case 'clear':
        // Clears all data from row 2 downwards, leaving the header intact.
        if (sheet.getLastRow() > 1) {
            sheet.getRange('A2:H' + sheet.getLastRow()).clearContent();
        }
        result = { status: 'success', message: 'All transactions cleared successfully.' };
        break;

      default:
        throw new Error("Invalid action specified: " + action);
    }

    // Return a success response.
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Log the error for debugging in Google Apps Script logs.
    console.error(error.toString());
    // Return an error response to the client app.
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

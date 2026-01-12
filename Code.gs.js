
/**
 * This function is a webhook that handles POST requests to manage transactions.
 * It's the secure bridge between your web app and the Google Sheet.
 * @param {Object} e The event parameter for a POST request.
 * @returns {ContentService.TextOutput} A JSON response indicating success or failure.
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transactions');
    if (!sheet) {
      throw new Error("Sheet 'Transactions' not found.");
    }

    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    
    let result;
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    switch (action) {
      case 'add':
        const transaction = postData.transaction;
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
        result = { status: 'success', message: 'Added' };
        break;

      case 'bulk_add':
        const transactions = postData.transactions;
        if (transactions && transactions.length > 0) {
          const rows = transactions.map(t => [
            t.id,
            t.type,
            t.amount,
            t.note,
            t.date,
            t.user,
            t.quantity,
            t.price
          ]);
          sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 8).setValues(rows);
        }
        result = { status: 'success', message: 'Bulk added ' + (transactions ? transactions.length : 0) + ' items' };
        break;

      case 'delete':
        const idToDelete = postData.transaction.id;
        for (var i = values.length - 1; i >= 1; i--) {
          if (values[i][0] == idToDelete) {
            sheet.deleteRow(i + 1);
            break;
          }
        }
        result = { status: 'success', message: 'Deleted' };
        break;

      case 'bulk_delete':
        const idsToDelete = postData.ids; // Array of IDs
        let deletedCount = 0;
        // Delete rows from bottom up to avoid index shifting issues
        for (var i = values.length - 1; i >= 1; i--) {
          if (idsToDelete.indexOf(Number(values[i][0])) !== -1) {
            sheet.deleteRow(i + 1);
            deletedCount++;
          }
        }
        result = { status: 'success', message: 'Bulk deleted ' + deletedCount + ' items' };
        break;

      case 'bulk_update':
        const idsToUpdate = postData.ids;
        const updates = postData.updates; // e.g. { type: 'coffee' }
        let updatedCount = 0;
        for (var i = 1; i < values.length; i++) {
          if (idsToUpdate.indexOf(Number(values[i][0])) !== -1) {
            if (updates.type) {
               sheet.getRange(i + 1, 2).setValue(updates.type); // Column B is Type
            }
            updatedCount++;
          }
        }
        result = { status: 'success', message: 'Bulk updated ' + updatedCount + ' items' };
        break;
      
      case 'clear':
        if (sheet.getLastRow() > 1) {
            sheet.getRange('A2:H' + sheet.getLastRow()).clearContent();
        }
        result = { status: 'success', message: 'Cleared' };
        break;

      default:
        throw new Error("Invalid action: " + action);
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

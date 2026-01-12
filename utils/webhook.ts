
import { Transaction, SyncAction } from '../types';

/**
 * Sends a change or a batch of changes to the Google Apps Script webhook.
 * @param webhookUrl The deployed URL of the Google Apps Script.
 * @param action The action to perform.
 * @param data The transaction data or array of data/ids depending on the action.
 * @returns A promise that resolves if the sync is successful.
 */
export const syncChangeToWebhook = async (
  webhookUrl: string,
  action: SyncAction,
  data?: any
): Promise<void> => {
  try {
    const payload: any = { action };
    
    if (action === 'add' || action === 'delete') {
      payload.transaction = data;
    } else if (action === 'bulk_delete') {
      payload.ids = data; // Expects an array of numbers
    } else if (action === 'bulk_update') {
      payload.ids = data.ids;
      payload.updates = data.updates; // e.g., { type: 'coffee' }
    } else if (action === 'bulk_add') {
      payload.transactions = data; // Expects an array of transactions
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(`Webhook returned an error: ${result.message}`);
    }

    console.log(`Webhook success: ${result.message}`);

  } catch (err) {
    console.error('Error syncing to webhook:', err);
    if (err instanceof Error) {
        throw new Error(err.message);
    }
    throw new Error('An unknown error occurred during webhook sync.');
  }
};

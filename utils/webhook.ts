import { Transaction } from '../types';

type SyncAction = 'add' | 'delete' | 'clear';

/**
 * Sends a change to the Google Apps Script webhook.
 * @param webhookUrl The deployed URL of the Google Apps Script.
 * @param action The action to perform ('add', 'delete', 'clear').
 * @param transaction The transaction data (required for 'add' and 'delete').
 * @returns A promise that resolves if the sync is successful.
 */
export const syncChangeToWebhook = async (
  webhookUrl: string,
  action: SyncAction,
  transaction?: Transaction
): Promise<void> => {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      mode: 'cors', // Required for cross-origin requests to Apps Script
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Apps Script webhooks often prefer text/plain
      },
      body: JSON.stringify({ action, transaction }),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(`Webhook returned an error: ${result.message}`);
    }

    // Success!
    console.log(`Webhook success: ${result.message}`);

  } catch (err) {
    console.error('Error syncing to webhook:', err);
    if (err instanceof Error) {
        throw new Error(err.message);
    }
    throw new Error('An unknown error occurred during webhook sync.');
  }
};

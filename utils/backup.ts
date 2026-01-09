
import { Transaction, IconMapping, ThemeType, BackupData } from '../types';

/**
 * Packages the current application state into a BackupData object.
 */
export const createBackupData = (
  transactions: Transaction[],
  iconMapping: IconMapping,
  theme: ThemeType
): BackupData => {
  return {
    version: 1,
    timestamp: new Date().toISOString(),
    transactions,
    iconMapping,
    theme
  };
};

/**
 * Triggers a browser download of the backup data as a JSON file.
 */
export const downloadBackupFile = (data: BackupData) => {
  const fileName = `office-bu-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};

/**
 * Reads a JSON file and returns the parsed BackupData.
 * Throws an error if the file is invalid.
 */
export const parseBackupFile = (file: File): Promise<BackupData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const parsed = JSON.parse(result);
        
        // Basic validation
        if (!parsed.transactions || !Array.isArray(parsed.transactions)) {
          throw new Error('Invalid backup file: Missing transaction data.');
        }
        if (!parsed.iconMapping) {
           throw new Error('Invalid backup file: Missing icon settings.');
        }
        
        resolve(parsed as BackupData);
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };
    
    reader.readAsText(file);
  });
};
